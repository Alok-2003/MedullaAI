import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, endpoints } from '../api/client'

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [otpStage, setOtpStage] = useState({ open: false, email: '', otp: '', sending: false })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post(endpoints.register, form)
      if (data?.success) {
        toast.success('Registration successful! OTP sent to your email')
        setOtpStage({ open: true, email: form.email, otp: '', sending: false })
      } else {
        toast.error(data?.message || 'Registration failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otpStage.otp || otpStage.otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }
    setOtpStage(s => ({ ...s, sending: true }))
    try {
      const { data } = await api.post(endpoints.verifyEmail, { email: otpStage.email, otp: otpStage.otp })
      if (data?.success) {
        toast.success('Email verified! You are now logged in')
        localStorage.setItem('token', data.token)
        navigate('/canvas', { replace: true })
      } else {
        toast.error(data?.message || 'Verification failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Verification failed'
      toast.error(msg)
    } finally {
      setOtpStage(s => ({ ...s, sending: false }))
    }
  }

  const resendOtp = async () => {
    try {
      await api.post(endpoints.resendOtp, { email: otpStage.email })
      toast.success('A new OTP has been sent')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to resend OTP'
      toast.error(msg)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className="hidden lg:block">
        <div className="relative h-[560px] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-1 shadow-2xl">
          <div className="absolute inset-0 blur-2xl opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="relative h-full w-full rounded-3xl bg-slate-900/60 backdrop-blur flex flex-col justify-end p-10">
            <h2 className="text-4xl font-bold mb-4">Join Medulla AI</h2>
            <p className="text-white/80 text-lg max-w-md">Create your account to access your AI Canvas. Verify your email with a one-time OTP for secure access.</p>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
          <p className="text-white/70 mb-6">Start your journey with a secure, OTP-verified login</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="jane@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/40"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Log in</Link>
          </p>
        </div>
      </div>

      {otpStage.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold">Verify your email</h3>
            <p className="text-white/70 mt-1">We sent a 6-digit OTP to <span className="text-white">{otpStage.email}</span></p>
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <input
                value={otpStage.otp}
                onChange={(e) => setOtpStage(s => ({ ...s, otp: e.target.value.replace(/\D/g, '').slice(0,6) }))}
                placeholder="Enter 6-digit OTP"
                inputMode="numeric"
                className="w-full text-center tracking-widest text-xl px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/40"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={resendOtp}
                  className="text-sm text-cyan-300 hover:text-cyan-200"
                >
                  Resend OTP
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setOtpStage({ open: false, email: '', otp: '', sending: false })}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otpStage.sending}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white disabled:opacity-50"
                  >
                    {otpStage.sending ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}