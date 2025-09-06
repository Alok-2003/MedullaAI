import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, endpoints } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post(endpoints.login, form)
      if (data?.success) {
        toast.success('Welcome back!')
        localStorage.setItem('token', data.token)
        navigate('/canvas', { replace: true })
      } else {
        toast.error(data?.message || 'Login failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div className="hidden lg:block">
        <div className="relative h-[560px] rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-1 shadow-2xl">
          <div className="absolute inset-0 blur-2xl opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="relative h-full w-full rounded-3xl bg-slate-900/60 backdrop-blur flex flex-col justify-end p-10">
            <h2 className="text-4xl font-bold mb-4">Welcome back</h2>
            <p className="text-white/80 text-lg max-w-md">Log in to access your AI Canvas and continue where you left off.</p>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-semibold mb-2">Log in</h1>
          <p className="text-white/70 mb-6">Secure access with verified email</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
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
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-white/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white font-medium shadow-lg shadow-cyan-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/70">
            New here?{' '}
            <Link to="/signup" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}