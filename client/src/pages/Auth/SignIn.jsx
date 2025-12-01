import { useState } from 'react'
import './Auth.css'
import Header from '../../components/header/Header'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useNavigate, useLocation, Link } from 'react-router-dom'

const SignIn = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitLoginLoading, setIsSubmitLoginLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [inputs, setInputs] = useState({
        email: '',
        password: '',
    })

    const onChange = (e) => {
        const { name, value } = e.target
        setInputs((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    const location = useLocation()

    const from = location.state?.from?.pathname || '/workspace'

    const validateInputs = () => {
        let errs = {}
        if (!inputs.email.trim()) errs.email = 'Email is required'
        if (!inputs.password.trim()) errs.password = 'Password is required'
        return errs
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitLoginLoading(true)

        // Basic validation
        const validationErrors = validateInputs()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            setIsSubmitLoginLoading(false)
            return
        }

        // Call login API from AuthContext
        const success = await login(inputs.email, inputs.password)

        setIsSubmitLoginLoading(false)

        if (!success) {
            setErrors({ serverError: 'Invalid email or password' })
            return
        }

        // Redirect after success
        navigate('/')
    }

    return (
        <>
            {/* HEADER */}
            <Header />

            {/* SIGN-IN PAGE */}
            <div className='signin-page'>
                <div className='signin-card'>
                    <div className='signin-card-inner'>
                        <h2 className='signin-title'>Sign in</h2>
                        <p className='signin-subtitle'>Great to see you again</p>

                        <form className='signin-form' onSubmit={onSubmit}>
                            {/* Email */}
                            <label className='signin-field'>
                                <span className='signin-label'>Email</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-envelope'></i>
                                    </span>
                                    <input type='email' name='email' placeholder='Enter your email' value={inputs.email} onChange={onChange} />
                                </div>
                                {errors.email && <p className='signin-error'>{errors.email}</p>}
                            </label>

                            {/* Password */}
                            <label className='signin-field'>
                                <span className='signin-label'>Password</span>
                                <div className='signin-input-wrapper'>
                                    <span className='signin-input-icon'>
                                        <i className='fa-solid fa-lock'></i>
                                    </span>
                                    <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Enter your password' value={inputs.password} onChange={onChange} />
                                    <button type='button' className='signin-eye-btn' onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? <i className='fa-regular fa-eye-slash'></i> : <i className='fa-regular fa-eye'></i>}
                                    </button>
                                </div>
                                {errors.password && <p className='signin-error'>{errors.password}</p>}
                            </label>

                            {errors.serverError && <p className='signin-error text-center'>{errors.serverError}</p>}

                            <button type='submit' className='signin-submit-btn' disabled={isSubmitLoginLoading}>
                                {isSubmitLoginLoading ? 'Signing in...' : 'Sign in'}
                            </button>

                            <button type='button' className='signin-link-btn'>
                                Forget your password?
                            </button>

                            <div className='signin-footer-text'>
                                Are you new here?{' '}
                                <Link to='/auth/signup' className='signin-link'>
                                    Create a free account
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignIn
