import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const links = [
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/predict',     label: 'New Prediction' },
  { to: '/history',     label: 'History' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="font-bold text-lg tracking-tight">LoanGuard</span>
        <div className="flex gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium pb-0.5 transition-colors ${
                location.pathname === l.to
                  ? 'text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{user?.name}</span>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-1.5 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}