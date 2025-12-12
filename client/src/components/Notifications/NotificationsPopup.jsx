import React, { useEffect } from 'react'
import '../../pages/workSpace/notifications/Notifications.css'

function formatDateTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export default function NotificationPopup({
    open,
    title = 'Notification',
    message = '',
    type = 'info', // 'success' | 'error' | 'warning' | 'info'
    category = 'System', // 'Patient message', 'Billing', ...
    from, // ex: 'Anna Nguyen'
    createdAt, // ISO string
    onClose,
    autoCloseMs = 5000, //null if do not want to turn it off automatically
}) {
    useEffect(() => {
        if (!open || !autoCloseMs) return
    }, [open, autoCloseMs, onClose])

    if (!open) return null

    return (
        <div className='notif-overlay' onClick={onClose}>
            <div className={`notif-popup notif-${type}`} onClick={(e) => e.stopPropagation()}>
                <button className='notif-close' onClick={onClose} type='button'>
                    ✕
                </button>

                {/* FLEX CHỈ BAO ICON + HEADER */}
                <div className='notif-main-row'>
                    <div className='notif-icon'>
                        {type === 'success' && '✅'}
                        {type === 'error' && '⚠️'}
                        {type === 'warning' && '⚠️'}
                        {type === 'info' && '💬'}
                    </div>

                    <div className='notif-content'>
                        <div className='notif-category-row'>
                            <span className='notif-category-badge'>{category}</span>
                        </div>

                        <h3 className='notif-title'>{title}</h3>

                        {(from || createdAt) && (
                            <div className='notif-meta'>
                                {from && <span className='notif-meta-item'>From: {from}</span>}
                                {createdAt && <span className='notif-meta-item'>{formatDateTime(createdAt)}</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* DETAIL ĐƯỢC TÁCH RA RIÊNG, FULL WIDTH */}
                <p className='notif-message notif-message-full'>{message}</p>
            </div>
        </div>
    )
}
