import { useState, useEffect } from 'react'
import { Lock, AlertCircle, X, ShieldCheck, Smartphone, ArrowLeft, UserCog, Shield, Scale, Eye } from 'lucide-react'
import { useData } from '../data/DataContext'

const ROLE_OPTIONS = [
  { username: 'field', label: 'Field Officer', desc: 'Patrol & arrest view (read-only)', icon: Shield, needsSms: false },
  { username: 'ocs', label: 'OCS - Desk Booking', desc: 'Station arrest & booking management', icon: UserCog, needsSms: false },
  { username: 'ocpd', label: 'OCPD - Command', desc: 'Divisional oversight dashboard', icon: Scale, needsSms: true },
  { username: 'ipoa', label: 'IPOA Inspector', desc: 'Oversight & audit dashboard', icon: Eye, needsSms: true },
]

export default function LoginModal({ open, onClose, requiredRole, dashboardName }) {
  const { login, requestSmsCode, verifySmsLogin, addToast } = useData()
  const [step, setStep] = useState('select')
  const [selected, setSelected] = useState(null)
  const [phone, setPhone] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)

  useEffect(() => {
    if (!open) {
      setStep('select')
      setSelected(null)
      setCode('')
      setDemoCode('')
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  if (!open) return null

  const handleSelect = (option) => {
    setError('')
    if (requiredRole) {
      const optionRole = { field: 'field_officer', ocs: 'ocs', ocpd: 'ocpd', ipoa: 'ipoa' }[option.username]
      if (optionRole !== requiredRole) {
        setError(`This dashboard requires ${requiredRole.toUpperCase()} access. Select the matching role.`)
        return
      }
    }
    if (!option.needsSms) {
      const result = login(option.username)
      if (result.success) {
        addToast(`Welcome, ${result.name}`, 'success')
        onClose()
      } else {
        setError('Sign-in failed. Please try again.')
      }
      return
    }
    setSelected(option)
    const result = requestSmsCode(option.username)
    if (result.success) {
      setPhone(result.phone)
      setDemoCode(result.code)
      setStep('sms')
      setResendIn(30)
      addToast(`Verification code sent via SMS to ${result.phone}`, 'info')
    } else {
      setError('User not found. Please select a valid role.')
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setError('')
    const result = verifySmsLogin(selected.username, code)
    if (result.success) {
      addToast(`Welcome, ${result.name}`, 'success')
      onClose()
    } else {
      setError(result.message || 'Incorrect code')
    }
  }

  const handleResend = () => {
    const result = requestSmsCode(selected.username)
    if (result.success) {
      setDemoCode(result.code)
      setResendIn(30)
      setError('')
      addToast('New verification code sent', 'info')
    }
  }

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
              <h2 className="text-lg font-bold text-slate-900">
                {step === 'select' ? 'Select Your Role' : 'SMS Verification'}
              </h2>
              <p className="text-xs text-slate-500">{dashboardName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'select' ? (
          <div className="p-5 space-y-3">
            <p className="text-xs text-slate-500">No password needed. Choose your duty role to continue.</p>
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.username}
                  onClick={() => handleSelect(option)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      {option.label}
                      {option.needsSms && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                          SMS 2FA
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{option.desc}</p>
                  </div>
                </button>
              )
            })}
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700 uppercase tracking-wide">Security:</span> OCPD and IPOA logins require a
                one-time SMS verification code sent to the officer's registered phone. In this prototype, the code is generated by the
                system and shown in the confirmation message.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="p-5 space-y-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">Code sent to {phone}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Demo code: <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{demoCode || '——'}</span>
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-1">Code expires in 5 minutes.</p>
            </div>
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Verify & Sign In
            </button>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => { setStep('select'); setCode(''); setError('') }} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Change role
              </button>
              <button type="button" onClick={handleResend} disabled={resendIn > 0} className="text-xs text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed">
                {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
