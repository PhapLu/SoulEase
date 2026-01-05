import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import { apiUtils } from '../../../../utils/newRequest'
import './StaffDetail.css'
import { EditIcon } from '../../Icon'

/** Presets */
const LANG_PRESETS = ['English', 'Vietnamese', 'Spanish', 'French', 'Chinese', 'Other']

const SPEC_PRESETS = ['Child and Adolescent Psychiatry', 'Adult Psychiatry', 'Geriatric Psychiatry', 'Forensic Psychiatry', 'Addiction Psychiatry', 'Sleep Psychiatry', "Women's Mental Health", 'Emergency Psychiatry', 'Personality Disorders']

const GENDER_PRESETS = ['F', 'M', 'Other']

const MIN_SPEC_FIELDS = 3

/** Utils */
function splitCSV(raw) {
    if (!raw) return []
    if (Array.isArray(raw))
        return raw
            .map(String)
            .map((s) => s.trim())
            .filter(Boolean)
    return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
}

function ensureMinFields(arr, min = 3) {
    const next = [...(arr || [])]
    while (next.length < min) next.push('')
    return next
}

function calcAgeFromBirthday(birthday) {
    // requirement: age = current year - birth year
    if (!birthday) return ''
    const d = new Date(birthday)
    if (Number.isNaN(d.getTime())) return ''
    const year = d.getFullYear()
    if (!year) return ''
    const currentYear = new Date().getFullYear()
    return Math.max(0, currentYear - year)
}

function stripDrPrefix(name) {
    return String(name || '')
        .replace(/^Dr\.\s*/i, '')
        .trim()
}

export default function DoctorDetail() {
    const { staffId } = useParams()

    const [doctor, setDoctor] = useState(null)
    const [editForm, setEditForm] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    /** Fetch doctor */
    useEffect(() => {
        const fetchDoctorDetail = async () => {
            try {
                const res = await apiUtils.get(`/user/readStaffDetail/${staffId}`)
                const data = res?.data?.metadata?.user

                const normalized = {
                    ...data,
                    fullName: stripDrPrefix(data?.fullName),
                    gender: data?.gender || data?.sex || '',

                    // edit-only arrays
                    languages: splitCSV(data?.language),
                    specialities: ensureMinFields(splitCSV(data?.speciality), MIN_SPEC_FIELDS),
                }

                // age computed (not typed)
                normalized.age = calcAgeFromBirthday(normalized.birthday)

                setDoctor(data || {})
                setEditForm(normalized || {})
            } catch (err) {
                console.error('fetch doctor fail', err)
            }
        }

        fetchDoctorDetail()
    }, [staffId])

    /** Recompute age when birthday changes */
    useEffect(() => {
        if (!editForm) return
        const age = calcAgeFromBirthday(editForm.birthday)
        setEditForm((prev) => ({ ...prev, age }))
    }, [editForm?.birthday])

    /** Validation */
    const validate = (form) => {
        const e = {}
        const phone = String(form?.phone || '')
        if (phone && !/^\d{10}$/.test(phone)) e.phone = 'Phone must be exactly 10 digits.'

        const exp = form?.experience
        if (exp !== undefined && exp !== '' && (!Number.isFinite(Number(exp)) || Number(exp) < 0)) {
            e.experience = 'Experience must be a non-negative number.'
        }

        if (!form?.fullName || !String(form.fullName).trim()) e.fullName = 'Name is required.'

        return e
    }

    /** Start edit */
    const handleStartEdit = () => {
        if (!editForm && doctor) {
            const normalized = {
                ...doctor,
                fullName: stripDrPrefix(doctor?.fullName),
                gender: doctor?.gender || doctor?.sex || '',
                languages: splitCSV(doctor?.language),
                specialities: ensureMinFields(splitCSV(doctor?.speciality), MIN_SPEC_FIELDS),
            }
            normalized.age = calcAgeFromBirthday(normalized.birthday)
            setEditForm(normalized)
        } else if (doctor && editForm) {
            // ensure arrays exist even if earlier state missing
            setEditForm((prev) => ({
                ...prev,
                gender: prev?.gender || prev?.sex || '',
                languages: Array.isArray(prev?.languages) ? prev.languages : splitCSV(prev?.language),
                specialities: ensureMinFields(Array.isArray(prev?.specialities) ? prev.specialities : splitCSV(prev?.speciality), MIN_SPEC_FIELDS),
                age: calcAgeFromBirthday(prev?.birthday),
            }))
        }

        setErrors({})
        setIsEditing(true)
    }

    /** Cancel */
    const handleCancel = () => {
        if (doctor) {
            const normalized = {
                ...doctor,
                fullName: stripDrPrefix(doctor?.fullName),
                gender: doctor?.gender || doctor?.sex || '',
                languages: splitCSV(doctor?.language),
                specialities: ensureMinFields(splitCSV(doctor?.speciality), MIN_SPEC_FIELDS),
            }
            normalized.age = calcAgeFromBirthday(normalized.birthday)
            setEditForm(normalized)
        }
        setErrors({})
        setIsEditing(false)
    }

    /** Save */
    const handleSave = async () => {
        const e = validate(editForm || {})
        setErrors(e)
        if (Object.keys(e).length) return

        setSaving(true)
        try {
            // 🔹 Prepare payload for backend
            const payload = {
                fullName: String(editForm?.fullName || '').trim(),
                email: editForm?.email || '',
                phone: editForm?.phone || '',
                address: editForm?.address || '',
                gender: editForm?.gender || '',
                birthday: editForm?.birthday || null,
                experience: editForm?.experience !== '' && editForm?.experience !== undefined ? Number(editForm.experience) : undefined,

                language: (editForm?.languages || [])
                    .map((s) => String(s).trim())
                    .filter(Boolean)
                    .join(', '),

                speciality: (editForm?.specialities || [])
                    .map((s) => String(s).trim())
                    .filter(Boolean)
                    .join(', '),
            }

            // 🔹 Call backend
            const res = await apiUtils.patch(`/user/updateStaffInfo/${staffId}`, payload)

            const updatedStaff = res?.data?.metadata?.staff

            // 🔹 Sync view state
            setDoctor(updatedStaff)

            setEditForm({
                ...updatedStaff,
                fullName: stripDrPrefix(updatedStaff?.fullName),
                gender: updatedStaff?.gender || '',
                languages: splitCSV(updatedStaff?.language),
                specialities: ensureMinFields(splitCSV(updatedStaff?.speciality), MIN_SPEC_FIELDS),
                age: calcAgeFromBirthday(updatedStaff?.birthday),
            })

            setIsEditing(false)
        } catch (err) {
            console.error('Update staff failed', err)
            throw err
        } finally {
            setSaving(false)
        }
    }

    /** Generic field change */
    const handleFieldChange = (field, value) => {
        // phone digits only
        if (field === 'phone') {
            const digits = String(value || '')
                .replace(/\D+/g, '')
                .slice(0, 10)
            setEditForm((prev) => ({ ...prev, phone: digits }))
            setErrors((prev) => {
                const copy = { ...prev }
                if (digits && !/^\d{10}$/.test(digits)) copy.phone = 'Phone must be exactly 10 digits.'
                else delete copy.phone
                return copy
            })
            return
        }

        // experience digits only (or empty)
        if (field === 'experience') {
            const filtered = String(value ?? '').replace(/[^\d]/g, '')
            setEditForm((prev) => ({ ...prev, experience: filtered }))
            setErrors((prev) => {
                const copy = { ...prev }
                if (filtered !== '' && (!Number.isFinite(Number(filtered)) || Number(filtered) < 0)) {
                    copy.experience = 'Experience must be a non-negative number.'
                } else delete copy.experience
                return copy
            })
            return
        }

        // birthday: age auto updates via effect
        if (field === 'birthday') {
            setEditForm((prev) => ({ ...prev, birthday: value }))
            return
        }

        setEditForm((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => {
            const c = { ...prev }
            delete c[field]
            return c
        })
    }

    const handleNameChange = (value) => {
        handleFieldChange('fullName', stripDrPrefix(value))
    }

    /** Language: preset chips + custom input */
    const toggleLanguage = (lang) => {
        setEditForm((prev) => {
            const cur = Array.isArray(prev?.languages) ? [...prev.languages] : []
            const idx = cur.findIndex((x) => x.toLowerCase() === String(lang).toLowerCase())
            if (idx >= 0) cur.splice(idx, 1)
            else cur.push(lang)
            return { ...prev, languages: cur }
        })
    }

    const addCustomLanguage = () => {
        const raw = String(editForm?.languageCustom || '').trim()
        if (!raw) return

        setEditForm((prev) => {
            const cur = Array.isArray(prev?.languages) ? [...prev.languages] : []
            if (!cur.some((x) => x.toLowerCase() === raw.toLowerCase())) cur.push(raw)
            return { ...prev, languages: cur, languageCustom: '' }
        })
    }

    const removeLanguage = (lang) => {
        setEditForm((prev) => {
            const cur = Array.isArray(prev?.languages) ? [...prev.languages] : []
            return {
                ...prev,
                languages: cur.filter((x) => x.toLowerCase() !== String(lang).toLowerCase()),
            }
        })
    }

    /** Speciality: preset chips + custom list input (add/remove) */
    const toggleSpecPreset = (spec) => {
        setEditForm((prev) => {
            const cur = Array.isArray(prev?.specialities) ? [...prev.specialities] : []
            const cleaned = cur.map((s) => String(s || '').trim())

            // If already exists -> remove all matches
            const exists = cleaned.some((s) => s.toLowerCase() === spec.toLowerCase())
            let next = exists
                ? cleaned.filter((s) => s.toLowerCase() !== spec.toLowerCase())
                : (() => {
                      // put into first empty slot if any, else append
                      const iEmpty = cleaned.findIndex((s) => !s)
                      if (iEmpty >= 0) {
                          const copy = [...cleaned]
                          copy[iEmpty] = spec
                          return copy
                      }
                      return [...cleaned, spec]
                  })()

            next = ensureMinFields(next, MIN_SPEC_FIELDS)
            return { ...prev, specialities: next }
        })
    }

    const handleSpecChange = (idx, value) => {
        setEditForm((prev) => {
            const cur = Array.isArray(prev?.specialities) ? [...prev.specialities] : ensureMinFields([], MIN_SPEC_FIELDS)
            cur[idx] = value
            return { ...prev, specialities: cur }
        })
    }

    const addSpecField = () => {
        setEditForm((prev) => ({
            ...prev,
            specialities: [...(prev?.specialities || ensureMinFields([], MIN_SPEC_FIELDS)), ''],
        }))
    }

    const removeSpecField = (idx) => {
        setEditForm((prev) => {
            const cur = Array.isArray(prev?.specialities) ? [...prev.specialities] : []
            cur.splice(idx, 1)
            return {
                ...prev,
                specialities: ensureMinFields(cur, MIN_SPEC_FIELDS),
            }
        })
    }

    /** Display helpers */
    const displayName = useMemo(() => {
        const name = String(editForm?.fullName || doctor?.fullName || '').trim()
        if (!name) return '—'

        const cleanName = stripDrPrefix(name)

        return doctor?.role === 'doctor' ? `Dr. ${cleanName}` : cleanName
    }, [doctor?.fullName, editForm?.fullName, doctor?.role])

    const sexLabel = useMemo(() => {
        const raw = editForm?.gender || doctor?.gender || doctor?.sex || ''
        const s = String(raw || '').trim()
        return s ? s.toUpperCase() : 'F/M'
    }, [doctor?.gender, doctor?.sex, editForm?.gender])

    const viewLanguages = useMemo(() => {
        const raw = doctor?.language
        const arr = splitCSV(raw)
        return arr.length ? arr.join(', ') : 'N/A'
    }, [doctor?.language])

    const viewSpecialities = useMemo(() => {
        const arr = splitCSV(doctor?.speciality)
        return ensureMinFields(arr, 3).slice(0, 3)
    }, [doctor?.speciality])

    return (
        <div className='dd-page'>
            <WorkspaceTopBar />

            <div className='dd-inner'>
                <section className='dd-header'>
                    <img className='dd-avatar' src={doctor?.avatar} alt={doctor?.fullName} />

                    <div className='dd-content'>
                        {/* Title */}
                        <div className='dd-titleRow'>
                            <div className='dd-titleLeft'>
                                {isEditing ? <input className='dd-input dd-input--title' value={editForm?.fullName || ''} onChange={(e) => handleNameChange(e.target.value)} placeholder='Full name' /> : <h2 className='dd-name'>{displayName}</h2>}

                                {/* Gender/Genre */}
                                {isEditing ? (
                                    <select className='dd-input dd-input--pill' value={editForm?.gender || ''} onChange={(e) => handleFieldChange('gender', e.target.value)}>
                                        <option value=''>F/M</option>
                                        {GENDER_PRESETS.map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className='dd-sex'>{sexLabel}</div>
                                )}
                            </div>

                            <div className='dd-actions'>
                                {isEditing ? (
                                    <>
                                        <button className='dd-btn dd-btn--primary' onClick={handleSave} disabled={saving || Object.keys(errors).length > 0} type='button'>
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className='dd-btn dd-btn--ghost' onClick={handleCancel} disabled={saving} type='button'>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button className='dd-iconBtn' onClick={handleStartEdit} type='button' aria-label='Edit'>
                                        <EditIcon />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BODY */}
                        {!isEditing ? (
                            <div className='dd-grid'>
                                <div className='dd-col'>
                                    <DisplayRow label='Email' value={doctor?.email || 'N/A'} isEmail />
                                    <DisplayRow label='Phone' value={doctor?.phone || 'N/A'} />
                                    <DisplayRow label='Birthday' value={doctor?.birthday || 'DD/MM/YYYY'} />
                                    <DisplayRow label='Age' value={doctor?.age ?? calcAgeFromBirthday(doctor?.birthday) ?? '[age]'} />
                                    <DisplayRow label='Address' value={doctor?.address || '[address]'} />
                                </div>

                                <div className='dd-col'>
                                    <DisplayRow label='Experience' value={doctor?.experience !== undefined && doctor?.experience !== null ? `${doctor.experience} years` : '—'} />
                                    <DisplayRow label='Language' value={viewLanguages} />
                                </div>
                            </div>
                        ) : (
                            <div className='dd-form'>
                                <FormRow label='Email'>
                                    <input className='dd-input' value={editForm?.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} placeholder='Email' />
                                </FormRow>

                                <FormRow label='Phone' error={errors.phone}>
                                    <input className='dd-input' value={editForm?.phone || ''} onChange={(e) => handleFieldChange('phone', e.target.value)} placeholder='0123456789' />
                                </FormRow>

                                <FormRow label='Birthday'>
                                    <input className='dd-input' type='date' value={editForm?.birthday || ''} onChange={(e) => handleFieldChange('birthday', e.target.value)} />
                                </FormRow>

                                <FormRow label='Age'>
                                    <input className='dd-input' value={editForm?.age ?? ''} disabled readOnly placeholder='Age' />
                                </FormRow>

                                <FormRow label='Address'>
                                    <input className='dd-input' value={editForm?.address || ''} onChange={(e) => handleFieldChange('address', e.target.value)} placeholder='Address' />
                                </FormRow>

                                <FormRow label='Experience' error={errors.experience}>
                                    <input className='dd-input' type='number' min={0} value={editForm?.experience ?? ''} onChange={(e) => handleFieldChange('experience', e.target.value)} placeholder='Years' />
                                </FormRow>

                                {/* Language with presets + custom */}
                                <FormRow label='Language'>
                                    <div className='dd-pickBox'>
                                        <div className='dd-presetGrid'>
                                            {LANG_PRESETS.map((lang) => {
                                                const active = (editForm?.languages || []).some((x) => String(x).toLowerCase() === lang.toLowerCase())
                                                return (
                                                    <button key={lang} type='button' className={`dd-chipBtn ${active ? 'active' : ''}`} onClick={() => toggleLanguage(lang)}>
                                                        {lang}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <div className='dd-selected'>
                                            {(editForm?.languages || []).length ? (
                                                (editForm.languages || []).map((lang) => (
                                                    <span key={lang} className='dd-selectedTag'>
                                                        {lang}
                                                        <button type='button' className='dd-tagX' onClick={() => removeLanguage(lang)}>
                                                            ×
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className='dd-muted'>No language selected</span>
                                            )}
                                        </div>

                                        <div className='dd-inline'>
                                            <input
                                                className='dd-input'
                                                value={editForm?.languageCustom || ''}
                                                onChange={(e) =>
                                                    setEditForm((p) => ({
                                                        ...p,
                                                        languageCustom: e.target.value,
                                                    }))
                                                }
                                                placeholder='Add custom language...'
                                            />
                                            <button type='button' className='dd-miniBtn' onClick={addCustomLanguage}>
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </FormRow>
                            </div>
                        )}

                        {/* Speciality */}
                        <div className={`dd-specialityRow ${isEditing ? 'is-editing' : ''}`}>
                            <div className='dd-specialityLabel'>Speciality:</div>

                            {isEditing ? (
                                <div className='dd-specEdit'>
                                    <div className='dd-presetGrid dd-presetGrid--spec'>
                                        {SPEC_PRESETS.map((spec) => {
                                            const active = (editForm?.specialities || []).some((x) => String(x).trim().toLowerCase() === spec.toLowerCase())
                                            return (
                                                <button key={spec} type='button' className={`dd-chipBtn ${active ? 'active' : ''}`} onClick={() => toggleSpecPreset(spec)} title={spec}>
                                                    {spec}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className='dd-specGrid'>
                                        {(editForm?.specialities || ensureMinFields([], MIN_SPEC_FIELDS)).map((val, idx) => (
                                            <div className='dd-specItem' key={idx}>
                                                <input className='dd-input' value={val || ''} onChange={(e) => handleSpecChange(idx, e.target.value)} placeholder={`Speciality ${idx + 1}`} />
                                                <button type='button' className='dd-specRemove' onClick={() => removeSpecField(idx)} aria-label='Remove speciality field' title='Remove'>
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button type='button' className='dd-miniBtn dd-miniBtn--add' onClick={addSpecField}>
                                        + Add speciality
                                    </button>
                                </div>
                            ) : (
                                <div className='dd-chips'>
                                    {viewSpecialities.map((s, i) => (
                                        <div key={i} className='dd-chip dd-chip--text'>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

/** Rows */
function DisplayRow({ label, value, isEmail }) {
    return (
        <div className='dd-field'>
            <div className='dd-label'>{label}:</div>
            <div className='dd-value'>
                {isEmail && value && value !== 'N/A' ? (
                    <a className='dd-link' href={`mailto:${value}`}>
                        {value}
                    </a>
                ) : (
                    <span>{String(value)}</span>
                )}
            </div>
        </div>
    )
}

function FormRow({ label, children, error }) {
    return (
        <div className='dd-formRow'>
            <div className='dd-label'>{label}:</div>
            <div className='dd-formControl'>
                {children}
                {error ? <div className='dd-error'>{error}</div> : null}
            </div>
        </div>
    )
}
