import mongoose from 'mongoose'

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const OrderSchema = new mongoose.Schema(
    {
        commissionServiceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommissionService',
        },
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        talentChosenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        temporaryTalentChosenId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        movementIds: [{ type: mongoose.Types.ObjectId, ref: 'Movement' }],
        subMovementIds: [{ type: mongoose.Types.ObjectId, ref: 'Movement' }],
        characterIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Character',
            },
        ],
        pastalTicketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PastalTicket',
        },
        status: {
            type: String,
            enum: ['waitlist', 'mockWaitlist', 'pending', 'approved', 'rejected', 'canceled', 'confirmed', 'in_progress', 'delivered', 'finished', 'under_processing', 'resolved', 'disbursed'],
            default: 'pending',
        },
        description: {
            type: String,
            default: '',
        },
        isDirect: { type: Boolean, required: true },
        references: [
            {
                type: String,
                default: [],
            },
        ],
        isTalentArchived: { type: Boolean, default: false },
        isMemberArchived: { type: Boolean, default: false },
        isReviewedByMember: { type: Boolean, default: false },
        isReviewedByTalent: { type: Boolean, default: false },
        rejectMessage: { type: String },
        cancelMessage: { type: String },
        hasPriceRange: { type: Boolean, default: true },
        minPrice: { type: Number },
        maxPrice: { type: Number },
        purpose: { type: String, enum: ['personal', 'commercial'] },
        isPrivate: { type: Boolean },
        deadline: { type: Date },
        fileFormats: { type: [String], default: [] },
        finalDelivery: {
            type: Object, // Ensures the whole object is optional
            note: { type: String },
            url: { type: String },
            files: [{ type: String }],
            finishedAt: { type: Date },
        },
        milestones: [
            {
                title: { type: String },
                note: { type: String },
                url: { type: String },
                files: [{ type: String, default: [] }],
                createdAt: { type: Date, default: Date.now },
            },
        ],
        deliveredAt: { type: Date, default: null },
        depositAmountPaid: { type: Number, default: 0 },
        refundDeadlineSnapShot: { type: Date },
        paypalPayment: {
            captureId: { type: String }, // Unique ID from PayPal
            orderId: { type: String }, // PayPal Order ID
            status: { type: String }, // Usually "COMPLETED"
            grossAmount: { type: Number }, // Before fee
            paypalFee: { type: Number }, // Fee
            netAmount: { type: Number }, // Received after fee
            currency: { type: String, default: 'USD' }, // Optional for now
            paidAt: { type: Date }, // PayPal timestamp
        },
        personalNotes: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                content: { type: String, required: true },
                position: { type: Number, default: 0 },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)
const Order = mongoose.model(DOCUMENT_NAME, OrderSchema)

export default Order
