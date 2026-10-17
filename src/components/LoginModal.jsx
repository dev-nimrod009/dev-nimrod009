import { useState } from 'react'
import { Lock, User, AlertCircle, X } from 'lucide-react'
import { useData } from '../data/DataContext'

export default function LoginModal({ open, onClose, requiredRole, dashboardName }) {
  const { login, addToast } = useData()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(username.trim(), password.trim())
    if (result.success) {
      const roleMatch = !requiredRole || result.role === requiredRole
      if (roleMatch) {
        addToast(`Welcome, ${result.name}`, 'success')
        setUsername('')
        setPassword('')
        onClose()
      } else {
        setError(`Access denied. This dashboard requires ${requiredRole.toUpperCase()} credentials.`)
      }
    } else {
      setError('Invalid username or password')
    }
  }

  const demoCreds = [
    { role: 'Field Officer', username: 'field', password: 'field123' },
    { role: 'OCS', username: 'ocs', password: 'ocs123' },
    { role: 'OCPD', username: 'ocpd', password: 'ocpd123' },
    { role: 'IPOA', username: 'ipoa', password: 'ipoa123' },
  ]

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Authentication Required</h2>
              <p className="text-xs text-slate-500">{dashboardName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
            Sign In
          </button>
        </form>
        <div className="px-5 pb-5">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-1">
              {demoCreds.map((c) => (
                <div key={c.username} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{c.role}</span>
                  <span className="font-mono text-slate-700">{c.username} / {c.password}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
