import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            // We await the login response
            await handleLogin({ email, password })

            // ✅ FIXED: Changed Maps to navigate
            navigate("/", { replace: true });

        } catch (err) {
            // Displays specific error from backend or a generic message
            setError(err.response?.data?.message || "Login failed. Check your connection.")
            console.error("Login Error:", err)
        }
    }

    if (loading) {
        return (<main className="loading-state"><h1>Authenticating...</h1></main>)
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                <div className="brand-header">
                    <span className="brand-icon">💠</span>
                    <h1>Interview<span className="highlight">Ace</span></h1>
                </div>

                {error && <p className="error-message" style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            required
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='Enter email address'
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            required
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Enter password'
                        />
                    </div>
                    <button type="submit" className='button primary-button'>Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"}>Register</Link> </p>
            </div>
        </main>
    )
}

export default Login