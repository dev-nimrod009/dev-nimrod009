import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Globe, Shield, ClipboardList, LayoutDashboard, Scale, Eye, KeyRound, ShieldCheck, LogOut, User } from 'lucide-react'
import { useData } from '../data/DataContext'
import ShiftActivationModal from './ShiftActivationModal'

const navItems = [
  { to: '/', label: 'Public Portal', icon: Globe, end: true, public: true },
  { to: '/field-officer', label: 'Field Officer', icon: Shield },
  { to: '/desk-officer', label: 'Desk Booking', icon: ClipboardList },
  { to: '/command', label: 'Command', icon: LayoutDashboard },
  { to: '/ipoa', label: 'IPOA', icon: Eye },
]

export default function Navbar() {
  const { shiftActive, shiftOfficer, currentUser, logout, addToast } = useData()
  const [shiftModalOpen, setShiftModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    addToast('Signed out successfully', 'info')
  }

  return (
    <>
      <nav className="bg-slate-950 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight sm:text-base">PCAAMS</h1>
                <p className="text-[10px] text-slate-400 hidden sm:block">Custody & Arrest Accountability</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                )
              })}

              {/* Auth Status */}
              {currentUser ? (
                <div className="flex items-center gap-2 ml-2 border-l border-slate-700 pl-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="bg-green-600 p-1 rounded-full">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="font-semibold text-white">{currentUser.name}</p>
                      <p className="text-slate-400 uppercase text-[9px]">{currentUser.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShiftModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ml-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Activate Shift
                </button>
              )}

              {shiftActive && (
                <button
                  onClick={() => setShiftModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Shift Active
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              )
            })}
            {currentUser && (
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-400 hover:text-red-400 transition-colors flex-shrink-0">
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <ShiftActivationModal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)} />
    </>
  )
}
