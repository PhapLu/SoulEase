import { useState } from 'react'
import './Auth.css'
import Header from '../../components/header/Header'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useAuth } from '../../contexts/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { apiUtils } from '../../utils/newRequest'

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
        const result = await login(inputs.email, inputs.password)

        setIsSubmitLoginLoading(false)

        if (!result?.success) {
            setErrors({ serverError: 'Invalid email or password' })
            return
        }

        if (result?.user?.role === 'family') {
            try {
                const res = await apiUtils.get('/relative/readMyPatientRecord')
                const patientRecord =
                    res?.data?.metadata?.patientRecord ||
                    res?.data?.patientRecord ||
                    null
                const folderId = patientRecord?.folderId
                const patientId = patientRecord?.patientId

                if (patientId && folderId) {
                    navigate(
                        `/workspace/patients/folder/${folderId}/${patientId}`
                    )
                    return
                }

                if (patientId) {
                    navigate(`/workspace/patients/${patientId}/profiles`)
                    return
                }
            } catch (err) {
                console.error(
                    'Failed to load relative patient record',
                    err
                )
            }
        }

        // Redirect after success
        navigate('/workspace')
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
                                    Create an account
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
