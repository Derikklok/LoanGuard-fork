import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Login() {
  const [tab, setTab]       = useState('login')   // 'login' | 'register'
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'officer' })
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email, password: form.password
      })
      login(data.user, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Login failed')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      await api.post('/auth/register', form)
      setSuccess('Account created! You can now sign in.')
      setTab('login')
      setForm({ ...form, name: '' })
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] bg-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-16">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome to<br />LoanGuard
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Enterprise-grade risk management and predictive credit analytics for institutional lenders. Lending integrity, powered by advanced artificial intelligence.
          </p>
        </div>
        <div className="relative z-10 flex gap-12">
          <div>
            <p className="text-blue-400 text-2xl font-bold">99.9%</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Uptime Reliability</p>
          </div>
          <div>
            <p className="text-blue-400 text-2xl font-bold">ISO</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">27001 Certified</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">

          {/* Tab Switch */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
              <p className="text-gray-400 text-sm mb-6">Access your risk management dashboard</p>

              {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg mb-4">{success}</p>}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" placeholder="officer@loanguard.com" value={form.email}
                      onChange={update('email')} className="flex-1 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs text-blue-600 hover:underline">Forgot?</a>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type="password" placeholder="••••••••" value={form.password}
                      onChange={update('password')} className="flex-1 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  Remember device for 30 days
                </label>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? 'Signing in...' : 'Login →'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                New risk officer?{' '}
                <button onClick={() => setTab('register')} className="text-blue-600 hover:underline font-medium">Register Account</button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-400 text-sm mb-6">Register as a new risk officer</p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input type="text" placeholder="James Sterling" value={form.name}
                      onChange={update('name')} className="flex-1 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Email Address</label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input type="email" placeholder="officer@loanguard.com" value={form.email}
                      onChange={update('email')} className="flex-1 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Password</label>
                  <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input type="password" placeholder="••••••••" value={form.password}
                      onChange={update('password')} className="flex-1 py-3 text-sm outline-none bg-transparent" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Role</label>
                  <select value={form.role} onChange={update('role')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-blue-500 transition-colors bg-white text-gray-700">
                    <option value="officer">Risk Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-blue-600 hover:underline font-medium">Sign In</button>
              </p>
            </>
          )}

          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              🔒 Auth Method: POST /auth/{tab === 'login' ? 'login' : 'register'}
            </span>
            <span className="text-xs text-gray-400">JWT Token Storage Enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}