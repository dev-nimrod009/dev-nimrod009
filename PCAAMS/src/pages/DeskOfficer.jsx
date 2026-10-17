import { useState, useMemo } from 'react'
import { ClipboardList, UserPlus, DoorOpen, Send, CheckCircle2, Gavel, ArrowRightLeft, Lock, Filter, AlertCircle, CreditCard, XCircle, Shield, Phone } from 'lucide-react'
import { useData } from '../data/DataContext'
import Modal from '../components/Modal'
import CountdownTimer, { getHoursHeld, getTimerColor, formatDuration, formatRemaining } from '../components/CountdownTimer'

function calculateAge(dob) {
  if (!dob) return 0
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

function validateIDNumber(id) { return /^\d{6,8}$/.test(id.trim()) }

function validatePhoneNumber(phone) {
  const cleaned = phone.trim()
  return /^\+254\s?7\d{2}\s?\d{3}\s?\d{3}$/.test(cleaned) || /^07\d{8}$/.test(cleaned.replace(/\s/g, ''))
}

function formatPhoneInput(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('254')) digits = '0' + digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length > 9) digits = digits.slice(0, 9)
  if (digits.length === 0) return ''
  let formatted = '+254 '
  if (digits.length > 0) formatted += digits.slice(0, 3)
  if (digits.length > 3) formatted += ' ' + digits.slice(3, 6)
  if (digits.length > 6) formatted += ' ' + digits.slice(6, 9)
  return formatted
}

export default function DeskOfficer() {
  const { detainees, stations, offenseTypes, addDetainee, updateDetaineeStatus, addToast, addAuditEntry, currentUser, processBailPayment, releaseOnBail, initiateTransfer } = useData()
  const [smsModal, setSmsModal] = useState(null)
  const [bailModal, setBailModal] = useState(null)
  const [transferModal, setTransferModal] = useState(null)
  const [courtModal, setCourtModal] = useState(null)
  const [errors, setErrors] = useState({})
  const [ledgerFilter, setLedgerFilter] = useState('all')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [form, setForm] = useState({
    fullName: '', idNumber: '', gender: 'Male', dob: '', arrestLocation: '',
    offenseType: offenseTypes[0], offenseSummary: '', arrestingOfficerServiceNo: '',
    cashBail: '', nextOfKinPhone: '', stationId: 'chuka', priorConvictions: 0, convictionDetails: '',
  })

  const inCustody = detainees.filter((d) => d.status === 'In Cells')

  const filteredLedger = useMemo(() => {
    let result = inCustody
    if (ledgerFilter !== 'all') {
      result = result.filter((d) => {
        const hours = getHoursHeld(d.bookingDate)
        if (ledgerFilter === 'green') return hours < 12
        if (ledgerFilter === 'yellow') return hours >= 12 && hours < 18
        if (ledgerFilter === 'red') return hours >= 18
        return true
      })
    }
    const q = ledgerSearch.trim().toLowerCase()
    if (q) result = result.filter((d) => d.fullName.toLowerCase().includes(q) || d.obNumber.toLowerCase().includes(q) || d.idNumber.toLowerCase().includes(q))
    return result
  }, [inCustody, ledgerFilter, ledgerSearch])

  const validateForm = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.idNumber.trim()) errs.idNumber = 'ID number is required'
    else if (!validateIDNumber(form.idNumber)) errs.idNumber = 'ID must be 6-8 digits'
    if (!form.dob) errs.dob = 'Date of birth is required'
    if (!form.arrestingOfficerServiceNo.trim()) errs.arrestingOfficerServiceNo = 'Officer service number is required'
    if (!form.nextOfKinPhone.trim()) errs.nextOfKinPhone = 'Next-of-kin phone is required'
    else if (!validatePhoneNumber(form.nextOfKinPhone)) errs.nextOfKinPhone = 'Format: +254 7XX XXX XXX'
    if (form.cashBail && parseInt(form.cashBail) < 0) errs.cashBail = 'Cash bail cannot be negative'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) { addToast('Please correct the errors in the form', 'error'); return }
    const bailValue = Math.max(0, parseInt(form.cashBail) || 0)
    const bailTermsStr = bailValue > 0 ? `KES ${bailValue.toLocaleString()}` : 'Non-Bailable'
    const age = calculateAge(form.dob)
    const { newDetainee, obNumber, station } = addDetainee({ ...form, age, cashBail: bailValue, bailTerms: bailTermsStr, bailPaid: false })
    setSmsModal({ detainee: newDetainee, obNumber, station, kinPhone: form.nextOfKinPhone })
    setForm({ fullName: '', idNumber: '', gender: 'Male', dob: '', arrestLocation: '', offenseType: offenseTypes[0], offenseSummary: '', arrestingOfficerServiceNo: '', cashBail: '', nextOfKinPhone: '', stationId: 'chuka', priorConvictions: 0, convictionDetails: '' })
    setErrors({})
  }

  const confirmSms = () => {
    if (smsModal) addToast(`SMS Notification Triggered to ${smsModal.kinPhone} via Africa's Talking API`, 'success')
    setSmsModal(null)
  }

  // --- BAIL FLOW ---
  const handleBailAction = (detainee) => {
    if (detainee.cashBail === 0 || detainee.bailTerms === 'Non-Bailable') {
      addToast('This detainee is non-bailable. Court production required.', 'error')
      return
    }
    setBailModal({ detainee, step: 'payment' })
  }

  const handleBailPayment = (paymentMethod) => {
    if (!bailModal) return
    const paymentRef = `${paymentMethod === 'ecitizen' ? 'ECITIZEN' : 'PCAAMS'}-${Date.now().toString().slice(-8)}`
    const result = processBailPayment(bailModal.detainee.id, paymentMethod, paymentRef)
    if (result.success) {
      addToast(`Payment of KES ${bailModal.detainee.cashBail.toLocaleString()} received via ${paymentMethod === 'ecitizen' ? 'eCitizen' : 'In-App Payment'}. Ref: ${paymentRef}`, 'success')
      setBailModal({ ...bailModal, step: 'confirm', paymentRef, paymentMethod })
    } else {
      addToast(result.message || 'Payment failed', 'error')
      setBailModal({ ...bailModal, step: 'failed', paymentMethod })
    }
  }

  const confirmBailRelease = () => {
    if (!bailModal) return
    const result = releaseOnBail(bailModal.detainee.id)
    if (result.success) {
      setBailModal(null)
    }
  }

  // --- TRANSFER FLOW ---
  const handleTransferAction = (detainee) => {
    setTransferModal({ detainee, toStationId: '' })
  }

  const confirmTransfer = () => {
    if (!transferModal || !transferModal.toStationId) {
      addToast('Please select a destination station', 'error')
      return
    }
    if (transferModal.toStationId === transferModal.detainee.stationId) {
      addToast('Cannot transfer to the same station', 'error')
      return
    }
    const result = initiateTransfer(transferModal.detainee.id, transferModal.toStationId, currentUser?.name || 'Desk Officer')
    if (result.success) {
      const toStation = stations.find((s) => s.id === transferModal.toStationId)
      addToast(`Transfer request sent to OCPD of ${toStation?.name}. SMS notification dispatched. Awaiting acceptance.`, 'info')
      setTransferModal(null)
    }
  }

  // --- COURT ---
  const confirmCourt = () => {
    if (!courtModal) return
    updateDetaineeStatus(courtModal.detainee.id, 'In Cells', { courtDate: new Date(Date.now() + 86400000).toISOString() })
    addToast(`Court production scheduled for ${courtModal.detainee.fullName}`, 'success')
    addAuditEntry(`Desk Officer scheduled court production for ${courtModal.detainee.obNumber}`, currentUser?.name || 'Desk Officer', { prevState: 'In Cells', newState: 'In Cells (Court Scheduled)' })
    setCourtModal(null)
  }

  const filterButtons = [
    { key: 'all', label: 'All', color: 'bg-slate-200 text-slate-700' },
    { key: 'green', label: '0-12h', color: 'bg-green-200 text-green-800' },
    { key: 'yellow', label: '12-18h', color: 'bg-yellow-200 text-yellow-800' },
    { key: 'red', label: '18h+', color: 'bg-red-200 text-red-800' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <ClipboardList className="w-4 h-4" />
          OB / Desk Booking Officer Dashboard
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Station Booking & Cell Management</h1>
        <p className="text-sm text-slate-600">Process new arrests and manage the active cell ledger with 24-hour compliance tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* New Arrest Booking Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h2 className="font-bold">New Arrest Booking</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Detainee Full Name" required value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} error={errors.fullName} />
              <FormField label="ID / Passport Number" required value={form.idNumber} onChange={(v) => setForm({ ...form, idNumber: v })} error={errors.idNumber} placeholder="6-8 digits" />
              <SelectField label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={['Male', 'Female']} />
              <DateField label="Date of Birth" required value={form.dob} onChange={(v) => setForm((prev) => ({ ...prev, dob: v, age: calculateAge(v) }))} error={errors.dob} calculatedAge={form.dob ? calculateAge(form.dob) : null} />
              <FormField label="Arrest Location" value={form.arrestLocation} onChange={(v) => setForm({ ...form, arrestLocation: v })} />
              <SelectField label="Offense Type" value={form.offenseType} onChange={(v) => setForm({ ...form, offenseType: v })} options={offenseTypes} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Offense Summary</label>
                <textarea value={form.offenseSummary} onChange={(e) => setForm({ ...form, offenseSummary: e.target.value })} placeholder="Brief description of the alleged offense..." rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
              </div>
              <FormField label="Arresting Officer Service No." required value={form.arrestingOfficerServiceNo} onChange={(v) => setForm({ ...form, arrestingOfficerServiceNo: v })} error={errors.arrestingOfficerServiceNo} />
              <FormField label="Cash Bail (KES)" type="number" value={form.cashBail} onChange={(v) => setForm({ ...form, cashBail: v })} placeholder="0 for non-bailable" error={errors.cashBail} min="0" />
              <PhoneField label="Next-of-Kin Phone" required value={form.nextOfKinPhone} onChange={(v) => setForm({ ...form, nextOfKinPhone: formatPhoneInput(v) })} error={errors.nextOfKinPhone} />
              <SelectField label="Station" value={form.stationId} onChange={(v) => setForm({ ...form, stationId: v })} options={stations.map((s) => ({ value: s.id, label: s.name }))} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Send className="w-5 h-5" />
              Submit & Create OB Entry
            </button>
          </form>
        </div>

        {/* Active Cell Ledger */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-2">
            <DoorOpen className="w-5 h-5" />
            <h2 className="font-bold">Active Station Cell Ledger</h2>
            <span className="ml-auto bg-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{inCustody.length} in custody</span>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Filter:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {filterButtons.map((btn) => (
                <button key={btn.key} onClick={() => setLedgerFilter(btn.key)} className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${ledgerFilter === btn.key ? btn.color + ' ring-2 ring-slate-400' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}>{btn.label}</button>
              ))}
            </div>
            <input type="text" value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)} placeholder="Search ledger..." className="sm:ml-auto w-full sm:w-40 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-slate-100 text-slate-800 text-left">
                  <th className="px-3 py-3 font-semibold">Detainee</th>
                  <th className="px-3 py-3 font-semibold">OB No.</th>
                  <th className="px-3 py-3 font-semibold">24h Countdown</th>
                  <th className="px-3 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLedger.map((d) => {
                  const hours = getHoursHeld(d.bookingDate)
                  const color = getTimerColor(hours)
                  const bgClass = color === 'red' ? 'bg-red-50' : color === 'yellow' ? 'bg-yellow-50' : ''
                  return (
                    <tr key={d.id} className={`hover:bg-slate-50 transition-colors ${bgClass}`}>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 text-xs">{d.fullName}</div>
                        <div className="text-[10px] text-slate-500">{d.offenseType}</div>
                        {d.bailPaid && <span className="inline-block mt-0.5 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Bail Paid</span>}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-700">{d.obNumber}</td>
                      <td className="px-3 py-3"><CountdownTimer bookingDate={d.bookingDate} showRemaining /></td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1 justify-end">
                          <button onClick={() => handleBailAction(d)} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded font-medium transition-colors">Bail</button>
                          <button onClick={() => setCourtModal({ detainee: d })} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded font-medium transition-colors">Court</button>
                          <button onClick={() => handleTransferAction(d)} className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded font-medium transition-colors">Transfer</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredLedger.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No detainees match the current filter.</div>}
          </div>
        </div>
      </div>

      {/* SMS Modal */}
      <Modal open={!!smsModal} onClose={() => setSmsModal(null)} title="SMS Notification - Africa's Talking API"
        footer={<><button onClick={() => setSmsModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button><button onClick={confirmSms} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2"><Send className="w-4 h-4" />Confirm & Send SMS</button></>}>
        {smsModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div><p className="font-semibold text-green-800 text-sm">OB Entry Created Successfully</p><p className="text-xs text-green-600">OB Number: <span className="font-mono font-bold">{smsModal.obNumber}</span></p></div>
            </div>
            <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-sm">
              <div className="text-xs text-slate-400 mb-2">SMS Preview - To: {smsModal.kinPhone}</div>
              <p className="leading-relaxed">"PCAAMS ALERT: {smsModal.detainee.fullName} has been booked at {smsModal.station.name}. OB Ref: {smsModal.obNumber}. Contact desk: {smsModal.station.phone}. Article 49 rights apply."</p>
            </div>
            <p className="text-xs text-slate-500">The next-of-kin will receive this SMS automatically via the Africa's Talking API gateway.</p>
          </div>
        )}
      </Modal>

      {/* Bail Payment Modal */}
      <Modal open={!!bailModal} onClose={() => setBailModal(null)} title="Cash Bail Processing"
        footer={bailModal?.step === 'confirm' ? (
          <><button onClick={() => setBailModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Close</button>
          <button onClick={confirmBailRelease} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Confirm Release</button></>
        ) : bailModal?.step === 'failed' ? (
          <><button onClick={() => setBailModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Close</button>
          <button onClick={() => setBailModal({ ...bailModal, step: 'payment' })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">Retry Payment</button></>
        ) : (
          <button onClick={() => setBailModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button>
        )}>
        {bailModal && (
          <div className="space-y-4">
            {bailModal.step === 'payment' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-lg"><CreditCard className="w-5 h-5 text-green-600" /></div>
                  <div><p className="font-semibold text-slate-900">{bailModal.detainee.fullName}</p><p className="text-xs text-slate-500 font-mono">{bailModal.detainee.obNumber}</p></div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Bail Amount Due</p>
                  <p className="text-3xl font-bold text-slate-900">{bailModal.detainee.bailTerms}</p>
                </div>
                <p className="text-xs text-slate-600">Select a payment method. The detainee cannot be released until payment is confirmed by the system.</p>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => handleBailPayment('ecitizen')} className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 transition-colors text-left">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div><p className="text-sm font-semibold text-slate-900">Pay via eCitizen</p><p className="text-xs text-slate-500">Government payment portal</p></div>
                  </button>
                  <button onClick={() => handleBailPayment('inapp')} className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 transition-colors text-left">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div><p className="text-sm font-semibold text-slate-900">Pay via In-App (M-Pesa)</p><p className="text-xs text-slate-500">Direct mobile money payment</p></div>
                  </button>
                </div>
              </>
            )}
            {bailModal.step === 'confirm' && (
              <>
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div><p className="font-semibold text-green-800 text-sm">Payment Confirmed</p><p className="text-xs text-green-600">Ref: {bailModal.paymentRef} via {bailModal.paymentMethod === 'ecitizen' ? 'eCitizen' : 'In-App M-Pesa'}</p></div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                  <p>Bail amount of <span className="font-bold">{bailModal.detainee.bailTerms}</span> has been received and verified. Click "Confirm Release" to process the release of <span className="font-bold">{bailModal.detainee.fullName}</span>.</p>
                </div>
              </>
            )}
            {bailModal.step === 'failed' && (
              <>
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div><p className="font-semibold text-red-800 text-sm">Payment Failed</p><p className="text-xs text-red-600">The payment could not be processed.</p></div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-slate-700">
                  <p className="font-semibold mb-1">Senior Override Option</p>
                  <p>If payment processing continues to fail, a senior officer (OCS or above) can manually input the release details from the Command Dashboard to authorize the release.</p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Transfer Modal */}
      <Modal open={!!transferModal} onClose={() => setTransferModal(null)} title="Initiate Inter-Station Transfer"
        footer={<><button onClick={() => setTransferModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button>
        <button onClick={confirmTransfer} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" />Send Transfer Request</button></>}>
        {transferModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-lg"><ArrowRightLeft className="w-5 h-5 text-purple-600" /></div>
              <div><p className="font-semibold text-slate-900">{transferModal.detainee.fullName}</p><p className="text-xs text-slate-500 font-mono">{transferModal.detainee.obNumber}</p></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              <p>Current station: <span className="font-semibold">{stations.find((s) => s.id === transferModal.detainee.stationId)?.name}</span></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Station</label>
              <select value={transferModal.toStationId} onChange={(e) => setTransferModal({ ...transferModal, toStationId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select destination station...</option>
                {stations.filter((s) => s.id !== transferModal.detainee.stationId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">An SMS notification will be sent to the OCPD of the destination station. The transfer will only proceed after the OCPD accepts the request. The detainee's details will then be sent to the receiving station's cell ledger.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Court Modal */}
      <Modal open={!!courtModal} onClose={() => setCourtModal(null)} title="Schedule Court Production"
        footer={<><button onClick={() => setCourtModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button>
        <button onClick={confirmCourt} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">Confirm</button></>}>
        {courtModal && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg"><Gavel className="w-5 h-5 text-blue-600" /></div>
              <div><p className="font-semibold text-slate-900">{courtModal.detainee.fullName}</p><p className="text-xs text-slate-500 font-mono">{courtModal.detainee.obNumber}</p></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700"><p>Confirm court production scheduling. A court date will be assigned and the detainee will remain in custody pending production.</p></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', required, placeholder, error, min }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
      {error && <p className="text-[10px] text-red-600 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function DateField({ label, value, onChange, required, error, calculatedAge }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
      {calculatedAge !== null && calculatedAge !== undefined && <p className="text-[10px] text-slate-500 mt-0.5">Calculated age: <span className="font-semibold text-slate-700">{calculatedAge} years</span></p>}
      {error && <p className="text-[10px] text-red-600 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function PhoneField({ label, value, onChange, required, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder="+254 7XX XXX XXX" className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`} />
      {error && <p className="text-[10px] text-red-600 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        {options.map((opt) => { const val = typeof opt === 'string' ? opt : opt.value; const lbl = typeof opt === 'string' ? opt : opt.label; return <option key={val} value={val}>{lbl}</option> })}
      </select>
    </div>
  )
}
