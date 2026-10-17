import { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { useData } from '../data/DataContext'
import LoginModal from './LoginModal'

export default function ProtectedRoute({ children, requiredRole, dashboardName }) {
  const { currentUser, logout, addToast } = useData()
  const [loginOpen, setLoginOpen] = useState(!currentUser)

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            You need to sign in to access the {dashboardName}. This dashboard contains sensitive law enforcement data and requires verified credentials.
          </p>
          <button
            onClick={() => setLoginOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Sign In to Continue
          </button>
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} requiredRole={requiredRole} dashboardName={dashboardName} />
      </div>
    )
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-4">
            You are signed in as <span className="font-semibold">{currentUser.name}</span> ({currentUser.role}).
            This dashboard requires <span className="font-semibold uppercase">{requiredRole}</span> credentials.
          </p>
          <button
            onClick={() => { logout(); addToast('Signed out', 'info'); setLoginOpen(true) }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out & Switch User
          </button>
        </div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} requiredRole={requiredRole} dashboardName={dashboardName} />
      </div>
    )
  }

  return children
}
