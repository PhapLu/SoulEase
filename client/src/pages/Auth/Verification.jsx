import { useEffect, useRef, useState } from 'react'
import Header from '../../components/header/Header'
import './Auth.css'
import { useLocation } from 'react-router-dom'
import { apiUtils } from '../../utils/newRequest'

const OTP_LENGTH = 6

export default function Verification() {
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
    const inputsRef = useRef([])
    const location = useLocation()
    const email = location.state?.email
    console.log(location.state)
    const handleChange = (value, idx) => {
        if (!/^[0-9]?$/.test(value)) return
        const next = [...otp]
        next[idx] = value
        setOtp(next)

        if (value && idx < OTP_LENGTH - 1) {
            inputsRef.current[idx + 1]?.focus()
        }
    }

    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
        if (!pasted) return
        const next = pasted.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH)
        setOtp(next)
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
        inputsRef.current[focusIndex]?.focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const code = otp.join('')

        try {
            await apiUtils.post('/auth/verifyOtp', {
                email,
                otp: code,
            })

            // Redirect to home or dashboard
            navigate('/workspace')
        } catch (err) {
            alert(err?.response?.data?.message || 'Invalid OTP')
        }
    }

    useEffect(() => {
        inputsRef.current[0]?.focus()
    }, [])

    return (
        <>
            <Header />
            <div className='verify-page'>
                <div className='verify-card'>
                    <div className='verify-logo'>SoulEase.</div>
                    <h1 className='verify-title'>OTP Verification</h1>
                    <p className='verify-subtitle'>Please enter 6 digit number that we send to your email</p>

                    <form className='verify-form' onSubmit={handleSubmit}>
                        <div className='verify-otp' onPaste={handlePaste}>
                            {otp.map((digit, idx) => (
                                <input key={idx} ref={(el) => (inputsRef.current[idx] = el)} type='text' inputMode='numeric' pattern='[0-9]*' maxLength={1} value={digit} onChange={(e) => handleChange(e.target.value, idx)} onKeyDown={(e) => handleKeyDown(e, idx)} aria-label={`OTP digit ${idx + 1}`} />
                            ))}
                        </div>

                        <button type='submit' className='verify-btn'>
                            Verify OTP
                        </button>
                    </form>

                    <p className='verify-resend'>
                        Don't receive the OTP code yet?{' '}
                        <button type='button' className='verify-resend__link'>
                            Send again
                        </button>
                    </p>
                </div>
            </div>
        </>
    )
}
