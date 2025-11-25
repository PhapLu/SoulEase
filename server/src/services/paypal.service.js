import axios from 'axios'
import { Buffer } from 'buffer'

const clientId = process.env.PAYPAL_CLIENT_ID
const clientSecret = process.env.PAYPAL_CLIENT_SECRET
const baseUrl = 'https://api-m.sandbox.paypal.com'
const loginAuthorizeUrl = 'https://www.sandbox.paypal.com/signin/authorize'

class PaypalService {
    static async getAccessToken() {
        const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        const res = await axios.post(`${baseUrl}/v1/oauth2/token`, new URLSearchParams({ grant_type: 'client_credentials' }), {
            headers: {
                Authorization: `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        return res.data.access_token
    }

    static async createOrder(orderPayload) {
        try {
            const token = await this.getAccessToken()
            console.log('🪙 TOKEN', token.slice(0, 10) + '...')

            const res = await axios.post(`${baseUrl}/v2/checkout/orders`, orderPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'PayPal-Partner-Attribution-Id': process.env.PAYPAL_BN_CODE,
                    'PayPal-Auth-Assertion': process.env.PAYPAL_AUTH_ASSERTION || '',
                },
            })

            console.log('✅ Create Order Response:', res.data)
            return res.data
        } catch (err) {
            console.error('❌ PayPal Create Order Failed:')
            if (err.response) {
                console.error('Status:', err.response.status)
                console.error('Headers:', JSON.stringify(err.response.headers, null, 2))
                console.error('Data:', JSON.stringify(err.response.data, null, 2))
            } else {
                console.error('Error Message:', err.message)
            }

            // Optional: rethrow a cleaner version to be handled by your service layer
            throw new Error(err.response?.data?.message || err.response?.data?.details?.[0]?.issue || err.message || 'Unknown PayPal error')
        }
    }

    static async captureOrder(orderId) {
        const token = await this.getAccessToken()
        const res = await axios.post(
            `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )
        return res.data
    }

    static async sendPayout(receiverEmail, amount, currency = 'USD', note = 'Pastal commission payout', senderBatchId = Date.now().toString()) {
        try {
            const token = await this.getAccessToken()

            // 🔐 Ensure amount is a string with 2 decimal places
            let formattedAmount = amount

            // Convert to string if number
            if (typeof amount === 'number') {
                formattedAmount = amount.toFixed(2) // e.g. 46.2 => "46.20"
            } else if (typeof amount === 'string') {
                // If string like "46", "46.2", "46.234", normalize it
                const num = parseFloat(amount)
                if (isNaN(num)) throw new Error('Invalid amount format')
                formattedAmount = num.toFixed(2)
            } else {
                throw new Error('Amount must be a number or numeric string')
            }

            const payoutPayload = {
                sender_batch_header: {
                    sender_batch_id: senderBatchId,
                    email_subject: 'You have a payout from Pastal',
                    email_message: 'You have received a payout! Thanks for working with us.',
                },
                items: [
                    {
                        recipient_type: 'EMAIL',
                        amount: {
                            value: formattedAmount,
                            currency,
                        },
                        receiver: receiverEmail,
                        note,
                        sender_item_id: 'item-' + senderBatchId,
                    },
                ],
            }

            const res = await axios.post(`${baseUrl}/v1/payments/payouts`, payoutPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            return res.data
        } catch (error) {
            if (error.response) {
                console.error('PayPal Payout Error Response:', JSON.stringify(error.response.data, null, 2))
            } else {
                console.error('Unexpected PayPal Error:', error.message)
            }
            throw error
        }
    }

    static async getPayoutStatus(payoutBatchId) {
        const token = await this.getAccessToken()
        const res = await axios.get(`${baseUrl}/v1/payments/payouts/${payoutBatchId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return res.data
    }

    // 1) Build the "Log in with PayPal" URL (for linking a user's PayPal to get payer_id)
    static getLoginWithPayPalUrl({ state, redirectUri }) {
        // Don’t pre-encode — just join the scopes
        const scope = ['openid', 'email', 'https://uri.paypal.com/services/paypalattributes'].join(' ')

        const params = new URLSearchParams({
            flowEntry: 'static',
            client_id: clientId,
            response_type: 'code',
            scope, // <-- raw string, URLSearchParams will encode once
            redirect_uri: redirectUri,
            state,
            nonce: String(Date.now()),
        })

        return `${loginAuthorizeUrl}?${params.toString()}`
    }

    // 2) Exchange the authorization code for tokens
    static async exchangeAuthCodeForTokens({ code, redirectUri }) {
        const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        const res = await axios.post(
            `${baseUrl}/v1/oauth2/token`,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
            {
                headers: {
                    Authorization: `Basic ${creds}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )
        return res.data // { access_token, refresh_token?, scope, ... }
    }

    // 3) Fetch PayPal user profile (contains payer ID + email when scope includes paypalattributes)
    static async getPaypalUserInfo(accessToken) {
        const res = await axios.get(`${baseUrl}/v1/identity/openidconnect/userinfo`, {
            params: { schema: 'openid' },
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        // res.data.user_id => payer ID; res.data.email => PayPal email
        return res.data
    }

    // 4) Send payout by Payer ID (preferred; avoids email typos)
    static async sendPayoutByPayerId(payerId, amount, currency = 'USD', note = 'Pastal commission payout', senderBatchId = Date.now().toString()) {
        try {
            const token = await this.getAccessToken()

            // normalize amount to "0.00"
            let formattedAmount
            if (typeof amount === 'number') formattedAmount = amount.toFixed(2)
            else if (typeof amount === 'string') {
                const n = parseFloat(amount)
                if (isNaN(n)) throw new Error('Invalid amount format')
                formattedAmount = n.toFixed(2)
            } else {
                throw new Error('Amount must be a number or numeric string')
            }

            const payload = {
                sender_batch_header: {
                    sender_batch_id: senderBatchId,
                    email_subject: 'You have a payout from Pastal',
                    email_message: 'You have received a payout! Thanks for working with us.',
                },
                items: [
                    {
                        recipient_type: 'PAYPAL_ID',
                        receiver: payerId,
                        amount: { value: formattedAmount, currency },
                        note,
                        sender_item_id: 'item-' + senderBatchId,
                    },
                ],
            }

            const res = await axios.post(`${baseUrl}/v1/payments/payouts`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
            return res.data
        } catch (error) {
            if (error.response) {
                console.error('PayPal Payout Error:', JSON.stringify(error.response.data, null, 2))
            } else {
                console.error('Unexpected PayPal Error:', error.message)
            }
            throw error
        }
    }

    static async createPartnerReferralLink({ state, userEmail }) {
        const token = await this.getAccessToken()

        const body = {
            partner_config_override: {
                return_url: `https://pastal-fe-baocao.onrender.com/paypal?state=${state}`,
                return_url_description: 'Return after PayPal onboarding',
            },
            operations: [
                {
                    operation: 'API_INTEGRATION',
                    api_integration_preference: {
                        rest_api_integration: {
                            integration_method: 'PAYPAL',
                            integration_type: 'THIRD_PARTY',
                            third_party_details: {
                                features: ['PAYMENT', 'REFUND'],
                            },
                        },
                    },
                },
            ],
            products: ['EXPRESS_CHECKOUT'],
            legal_consents: [{ type: 'SHARE_DATA_CONSENT', granted: true }],
            seller_intent: 'CASUAL',
            email: userEmail,
        }

        const res = await axios.post(`${baseUrl}/v2/customer/partner-referrals`, body, { headers: { Authorization: `Bearer ${token}` } })

        // Extract partner_referral_id from the "self" link
        const selfLink = res.data.links.find((l) => l.rel === 'self')?.href
        const partnerReferralId = selfLink ? selfLink.split('/').pop() : null

        const actionUrl = res.data.links.find((l) => l.rel === 'action_url').href

        return { actionUrl, partnerReferralId }
    }

    static async getPartnerReferralDetails(partnerReferralId) {
        const token = await this.getAccessToken()
        const res = await axios.get(`${baseUrl}/v2/customer/partner-referrals/${partnerReferralId}`, { headers: { Authorization: `Bearer ${token}` } })

        return res.data
    }

    static async getMerchantIntegration(integrationUrlOrId) {
        const token = await this.getAccessToken()

        let url
        if (integrationUrlOrId.startsWith('http')) {
            url = integrationUrlOrId // full link from referral details
        } else {
            url = `${baseUrl}/v1/customer/partners/${process.env.PAYPAL_PARTNER_ID}/merchant-integrations/${integrationUrlOrId}`
        }
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        return res.data
    }

    static async verifyWebhookSignature(req) {
        const token = await this.getAccessToken()

        const headers = req.headers

        const payload = {
            transmission_id: headers['paypal-transmission-id'],
            transmission_time: headers['paypal-transmission-time'],
            cert_url: headers['paypal-cert-url'],
            auth_algo: headers['paypal-auth-algo'],
            transmission_sig: headers['paypal-transmission-sig'],
            webhook_id: process.env.PAYPAL_ONBOARDING_WEBHOOK_ID, // from PayPal dashboard
            webhook_event: req.body,
        }

        try {
            const res = await axios.post(`${baseUrl}/v1/notifications/verify-webhook-signature`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
            return res.data.verification_status === 'SUCCESS'
        } catch (err) {
            console.error('Webhook verification failed:', err.response?.data || err.message)
            return false
        }
    }
}

export default PaypalService
