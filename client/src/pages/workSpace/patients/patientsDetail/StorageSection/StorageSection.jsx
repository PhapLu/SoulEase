import React, { useEffect, useMemo, useRef, useState } from 'react'
import './StorageSection.css'
import '../TreatmentSection/TreatmentSession.css'
import { apiUtils } from '../../../../../utils/newRequest'

export default function StorageSection({ onRefresh, patientRecordId, onSave, onCancel, readOnly = false, initialImages = [], initialFiles = [] }) {
    const [tab, setTab] = useState('image')
    const [open, setOpen] = useState(false)

    const [images, setImages] = useState(initialImages)
    const [files, setFiles] = useState(initialFiles)

    const [dirty, setDirty] = useState(false)

    // Zoom modal
    const [preview, setPreview] = useState(null)

    const imageInputRef = useRef(null)
    const fileInputRef = useRef(null)
    const ddRef = useRef(null)
    const [pendingDeletes, setPendingDeletes] = useState([])

    useEffect(() => {
        const onDown = (e) => {
            if (!ddRef.current) return
            if (!ddRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [])

    useEffect(() => {
        setImages(initialImages)
    }, [initialImages])

    useEffect(() => {
        setFiles(initialFiles)
    }, [initialFiles])

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') setPreview(null)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [])

    const handlePickImage = () => {
        if (readOnly) return
        setOpen(false)
        imageInputRef.current?.click()
    }

    const handlePickFile = () => {
        if (readOnly) return
        setOpen(false)
        fileInputRef.current?.click()
    }

    const onUploadImages = (e) => {
        if (readOnly) return
        const selected = Array.from(e.target.files || [])
        if (!selected.length) return

        const mapped = selected.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
        }))

        setImages((prev) => [...prev, ...mapped])
        setDirty(true)
        e.target.value = ''
        setTab('image')
    }

    const onUploadFiles = (e) => {
        if (readOnly) return
        const selected = Array.from(e.target.files || [])
        if (!selected.length) return

        const mapped = selected.map((file) => ({
            file,
            name: file.name,
            size: file.size,
        }))

        setFiles((prev) => [...prev, ...mapped])
        setDirty(true)
        e.target.value = ''
        setTab('files')
    }

    const removeImage = (idx) => {
        if (readOnly) return

        const img = images[idx]

        // local image → just remove
        if (img.url?.startsWith('blob:')) {
            URL.revokeObjectURL(img.url)
        }
        // server image → mark for deletion
        else if (img._id) {
            setPendingDeletes((prev) => [...prev, img._id])
        }

        setImages((prev) => prev.filter((_, i) => i !== idx))
        setDirty(true)
    }

    const removeFile = (idx) => {
        if (readOnly) return

        const f = files[idx]

        // local file
        if (!f.url) {
            setFiles((prev) => prev.filter((_, i) => i !== idx))
            setDirty(true)
            return
        }

        // server file → mark for deletion
        if (f._id) {
            setPendingDeletes((prev) => [...prev, f._id])
        }

        setFiles((prev) => prev.filter((_, i) => i !== idx))
        setDirty(true)
    }

    const headerTitle = useMemo(() => 'Storage', [])

    const handleSave = async () => {
        try {
            // 1) upload new files
            await onSave?.({ images, files })

            // 2) delete confirmed files
            for (const storageId of pendingDeletes) {
                await apiUtils.delete(`/patientRecord/deleteFile/${patientRecordId}/${storageId}`)
            }

            // 3) refetch ONCE after everything
            await onRefresh?.()

            setPendingDeletes([])
            setDirty(false)
        } catch (err) {
            console.error('Save storage failed', err)
        }
    }

    const handleCancel = () => {
        setOpen(false)
        setPreview(null)

        images.forEach((img) => {
            if (img.url?.startsWith('blob:')) {
                URL.revokeObjectURL(img.url)
            }
        })

        setImages(initialImages)
        setFiles(initialFiles)
        setPendingDeletes([]) // 👈 important
        setDirty(false)

        onCancel?.()
    }

    useEffect(() => {
        return () => {
            images.forEach((img) => {
                if (img.url?.startsWith('blob:')) {
                    URL.revokeObjectURL(img.url)
                }
            })
        }
    }, [])

    return (
        <section className='pd-storage'>
            <div className='pd-storage__header'>
                <h3 title='Open treatment details'>{headerTitle}</h3>

                {!readOnly && (
                    <div className='tp-dd' ref={ddRef}>
                        <button className='tp-btn-icon tp-btn-icon--primary' onClick={() => setOpen((v) => !v)} type='button' aria-haspopup='menu' aria-expanded={open}>
                            <svg className='size-6' xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                <path d='M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z' />
                            </svg>
                        </button>

                        {open && (
                            <div className='tp-dd__menu' role='menu'>
                                <button className='tp-dd__item' type='button' onClick={handlePickImage} role='menuitem'>
                                    Upload Images
                                </button>

                                <button className='tp-dd__item' type='button' onClick={handlePickFile} role='menuitem'>
                                    Upload Files
                                </button>
                            </div>
                        )}

                        <input ref={imageInputRef} type='file' accept='image/*' multiple hidden onChange={onUploadImages} />
                        <input ref={fileInputRef} type='file' multiple hidden onChange={onUploadFiles} />
                    </div>
                )}
            </div>

            <div className='pd-storage__tabs'>
                <button className={tab === 'image' ? 'active' : ''} onClick={() => setTab('image')} type='button'>
                    Image
                </button>
                <button className={tab === 'files' ? 'active' : ''} onClick={() => setTab('files')} type='button'>
                    Files
                </button>
            </div>

            <div className='pd-storage__box'>
                {tab === 'image' ? (
                    <div className='pd-storage__grid'>
                        {images.length === 0 ? (
                            <div className='pd-storage__empty'>No images</div>
                        ) : (
                            images.map((img, i) => (
                                <div className='pd-storage__thumb' key={`${img.name}-${i}`}>
                                    <button
                                        className='pd-storage__thumbBtn'
                                        type='button'
                                        onClick={() =>
                                            setPreview({
                                                url: img.url,
                                                name: img.name,
                                            })
                                        }
                                        title='Click to zoom'
                                    >
                                        <img src={img.url} alt={img.name} />
                                    </button>

                                    {!readOnly && (
                                        <button className='pd-storage__remove' type='button' onClick={() => removeImage(i)} title='Remove'>
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className='pd-storage__list'>
                        {files.length === 0 ? (
                            <div className='pd-storage__empty'>No files</div>
                        ) : (
                            files.map((f, i) => (
                                <div className='pd-storage__row' key={`${f.name}-${i}`}>
                                    <a className='pd-storage__fileName' href={f.url} target='_blank' rel='noopener noreferrer' title={f.name}>
                                        {f.name}
                                    </a>

                                    <div className='pd-storage__meta'>
                                        <span>{formatBytes(f.size)}</span>

                                        {!readOnly && (
                                            <button className='folder-btn-delete' type='button' onClick={() => removeFile(i)} title='Remove'>
                                                <span>
                                                    <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 -960 960 960' width='20px' fill='#ef4444'>
                                                        <path d='M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z' />
                                                    </svg>
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {dirty && !readOnly && (
                <div className='pd-storage__actions'>
                    <button className='folder-cancel-btn' type='button' onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className='folder-save-btn' type='button' onClick={handleSave}>
                        Save
                    </button>
                </div>
            )}

            {preview && (
                <div className='pd-preview' onMouseDown={() => setPreview(null)} role='dialog' aria-modal='true'>
                    <div className='pd-preview__panel' onMouseDown={(e) => e.stopPropagation()}>
                        <div className='pd-preview__top'>
                            <div className='pd-preview__title' title={preview.name}>
                                {preview.name}
                            </div>
                            <button className='pd-preview__close' type='button' onClick={() => setPreview(null)}>
                                ×
                            </button>
                        </div>
                        <div className='pd-preview__body'>
                            <img src={preview.url} alt={preview.name} />
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

function formatBytes(bytes = 0) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
    const val = bytes / Math.pow(k, i)
    return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}
