import { useState } from 'react'
import './Auth.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Header from '../../components/header/Header'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiUtils } from '../../utils/newRequest'

import { isFilled, minLength, isValidEmail, isValidPassword } from '../../utils/validator'

const SignUp = () => {
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [showPassword, setShowPassword] = useState(false)
    const [inputs, setInputs] = useState({
        email: '',
        fullName: '',
        password: '',
        confirmPassword: '',
    })

    const onChange = (e) => {
        const { name, value } = e.target

        setInputs((prev) => {
            const updated = { ...prev, [name]: value }

            // If password changes, reset confirmPassword error
            if (name === 'password' && prev.confirmPassword) {
                setErrors((e) => ({ ...e, confirmPassword: '' }))
            }

            return updated
        })

        setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        const validationErrors = validateInputs()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setIsSubmitting(false)
            return
        }

        try {
            const payload = {
                email: inputs.email,
                fullName: inputs.fullName,
                password: inputs.password,
            }

            const res = await apiUtils.post('/auth/signUp', payload)

            if (res?.data?.metadata?.email) {
                navigate('/auth/verification', {
                    state: { email: inputs.email },
                })
            }
        } catch (err) {
            setErrors({
                serverError: err?.response?.data?.message || 'Registration failed. Try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const validateInputs = () => {
        let errs = {}

        // Email
        if (!isFilled(inputs.email)) {
            errs.email = 'Please enter your email'
        } else if (!isValidEmail(inputs.email)) {
            errs.email = 'Invalid email'
        }

        // Password
        if (!isFilled(inputs.password)) {
            errs.password = 'Please enter a password'
        } else if (!isValidPassword(inputs.password)) {
            errs.password = 'Password must contain at least 6 characters, 1 number, and 1 special character.'
        }

        // Confirm Password
        if (!isFilled(inputs.confirmPassword)) {
            errs.confirmPassword = 'Please confirm your password'
        } else if (inputs.confirmPassword !== inputs.password) {
            errs.confirmPassword = 'Passwords do not match'
        }

        // Full name
        if (!isFilled(inputs.fullName)) {
            errs.fullName = 'Please enter your full name'
        } else if (!minLength(inputs.fullName, 4)) {
            errs.fullName = 'Full name must be at least 4 characters'
        }

        return errs
    }

    return (
        <>
            {/* HEADER */}
            <Header />
            <div className='signin-page'>
                <div className='signin-card'>
                    <div className='signin-card-inner'>
                        <h2 className='signin-title'>Sign Up</h2>
                        <p className='signin-subtitle'>Welcome to SoulEase</p>

                        <form className='signin-form' onSubmit={onSubmit}>
                            {/* Email */}
                            <label className='signin-field'>
                                <span className='signin-label'>Email</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-envelope'></i>
                                    </span>
                                    <input type='email' name='email' placeholder='Enter your email' value={inputs.email} onChange={onChange} required />
                                </div>
                                {errors.email && <p className='signin-error'>{errors.email}</p>}
                            </label>

                            {/* Full Name */}
                            <label className='signin-field'>
                                <span className='signin-label'>Full name</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-user'></i>
                                    </span>
                                    <input type='text' name='fullName' placeholder='Enter your full name' value={inputs.fullName} onChange={onChange} required />
                                </div>
                                {errors.fullName && <p className='signin-error'>{errors.fullName}</p>}
                            </label>

                            {/* Password */}
                            <label className='signin-field'>
                                <span className='signin-label'>Password</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-lock'></i>
                                    </span>
                                    <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Enter your password' value={inputs.password} onChange={onChange} required />
                                    <button type='button' className='signin-eye-btn' onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? <i className='fa-regular fa-eye-slash'></i> : <i className='fa-regular fa-eye'></i>}
                                    </button>
                                </div>
                                {errors.password && <p className='signin-error'>{errors.password}</p>}
                            </label>

                            <label className='signin-field'>
                                <span className='signin-label'>Confirm Password</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-lock'></i>
                                    </span>
                                    <input type={showPassword ? 'text' : 'password'} name='confirmPassword' placeholder='Enter your password' value={inputs.confirmPassword} onChange={onChange} required />
                                    <button type='button' className='signin-eye-btn' onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? <i className='fa-regular fa-eye-slash'></i> : <i className='fa-regular fa-eye'></i>}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className='signin-error'>{errors.confirmPassword}</p>}
                            </label>

                            {errors.serverError && <p className='signin-error text-center'>{errors.serverError}</p>}
                            <button type='submit' className='signin-submit-btn' disabled={isSubmitting}>
                                {isSubmitting ? 'Signing up...' : 'Sign up'}
                            </button>

                            <div className='signin-footer-text'>
                                Have an account already?{' '}
                                <Link to='/auth/signin' className='signin-link'>
                                    Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignUp
