import { useState } from 'react'
import { KeyRound, X, ShieldCheck, AlertCircle } from 'lucide-react'
import { useData } from '../data/DataContext'
import Modal from './Modal'

export default function ShiftActivationModal({ open, onClose }) {
  const { activateShift, addToast, shiftActive, shiftOfficer, deactivateShift } = useData()
  const [serviceNo, setServiceNo] = useState('')
  const [shiftCode, setShiftCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!serviceNo.trim() || !shiftCode.trim()) {
      setError('Both fields are required')
      return
    }
    const success = activateShift(serviceNo.trim(), shiftCode.trim())
    if (success) {
      addToast('Shift activated - Desk Booking permissions granted', 'success')
      setServiceNo('')
      setShiftCode('')
      onClose()
    } else {
      setError('Invalid service number or shift code. Try service No. 2341 and code OCS-2026')
    }
  }

  const handleDeactivate = () => {
    deactivateShift()
    addToast('Shift ended - session reverted to read-only', 'info')
    onClose()
  }

  if (shiftActive && open) {
    return (
      <Modal open={open} onClose={onClose} title="Active Shift Session">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Shift Active</p>
              <p className="text-xs text-green-600">Officer: {shiftOfficer?.name} (#{shiftOfficer?.serviceNo})</p>
              <p className="text-xs text-green-600">Rank: {shiftOfficer?.rank}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Your session has elevated permissions for desk booking. The shift will automatically expire after 8 hours of inactivity.</p>
          <button onClick={handleDeactivate} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
            End Shift Session
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Shift Duty Activation"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Activate Shift
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <KeyRound className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700">
            Enter your NPS Service Number and the OCS-issued Shift Activation Token to temporarily elevate your session from Field Officer (Read-Only) to Desk Booking Officer (Write Access).
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">NPS Service Number</label>
          <input
            type="text"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            placeholder="e.g. 2341"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">OCS Shift Activation Token</label>
          <input
            type="text"
            value={shiftCode}
            onChange={(e) => setShiftCode(e.target.value)}
            placeholder="e.g. OCS-2026"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
        <p className="text-[10px] text-slate-400">Demo: Use service No. <span className="font-mono font-semibold">2341</span> and token <span className="font-mono font-semibold">OCS-2026</span></p>
      </div>
    </Modal>
  )
}
