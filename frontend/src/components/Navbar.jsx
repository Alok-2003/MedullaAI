import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') setAuthed(!!e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    // refresh state on route change in case token changed in same tab
    setAuthed(!!localStorage.getItem('token'))
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('token')
    setAuthed(false)
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/5 bg-white/5 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-cyan-500/20" />
          <span className="font-semibold tracking-wide">Medulla AI</span>
        </Link>
        {!authed ? (
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-white/10 transition">Login</Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white shadow-md hover:shadow-cyan-500/20 transition">Sign Up</Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/canvas" className="px-4 py-2 rounded-lg hover:bg-white/10 transition">Canvas</Link>
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition">Logout</button>
          </nav>
        )}
      </div>
    </header>
  )
}
