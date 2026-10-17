import { useState, useMemo } from 'react'
import { LayoutDashboard, AlertTriangle, Clock, Users, Building2, ArrowRightLeft, Check, History, Lock, FileDown, FileText, Shield, Phone, AlertCircle, XCircle, Scale } from 'lucide-react'
import { useData } from '../data/DataContext'
import Modal from '../components/Modal'
import LegalReferencePanel from '../components/LegalReferencePanel'
import CountdownTimer, { getHoursHeld, getTimerColor, formatDuration, formatRemaining } from '../components/CountdownTimer'

export default function CommandDashboard() {
  const { detainees, transfers, stations, auditTrail, approveTransfer, addToast, exportAuditCSV, exportAuditPDF, currentUser, ocpdAcceptTransfer, completeTransfer, seniorManualRelease } = useData()
  const [mode, setMode] = useState('ocs')
  const [acceptTransferModal, setAcceptTransferModal] = useState(null)
  const [manualReleaseModal, setManualReleaseModal] = useState(null)
  const [lawModal, setLawModal] = useState(null)

  const stationId = 'chuka'
  const stationDetainees = detainees.filter((d) => d.stationId === stationId)
  const inCustody = stationDetainees.filter((d) => d.status === 'In Cells')
  const pendingBail = stationDetainees.filter((d) => d.status === 'In Cells' && d.cashBail > 0)
  const impendingViolations = inCustody.filter((d) => getHoursHeld(d.bookingDate) > 18)
  const avgTime = inCustody.length > 0 ? inCustody.reduce((sum, d) => sum + getHoursHeld(d.bookingDate), 0) / inCustody.length : 0

  const handleAcceptTransfer = (transfer) => {
    setAcceptTransferModal(transfer)
  }

  const confirmAcceptTransfer = () => {
    if (!acceptTransferModal) return
    ocpdAcceptTransfer(acceptTransferModal.id, currentUser?.name || 'OCPD')
    setAcceptTransferModal(null)
  }

  const handleCompleteTransfer = (transferId) => {
    completeTransfer(transferId, currentUser?.name || 'OCPD')
  }

  const handleManualRelease = (detainee) => {
    setManualReleaseModal({ detainee, seniorName: '', seniorServiceNo: '', reason: '' })
  }

  const confirmManualRelease = () => {
    if (!manualReleaseModal) return
    const { detainee, seniorName, seniorServiceNo, reason } = manualReleaseModal
    if (!seniorName.trim() || !seniorServiceNo.trim() || !reason.trim()) {
      addToast('All fields are required for manual release', 'error')
      return
    }
    seniorManualRelease(detainee.id, { seniorName, seniorServiceNo, reason })
    setManualReleaseModal(null)
  }

  const transferStatusBadge = (status) => {
    const styles = {
      'Pending OCPD Approval': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'OCPD Accepted - Awaiting Processing': 'bg-blue-100 text-blue-800 border-blue-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'Approved': 'bg-green-100 text-green-800 border-green-300',
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <LayoutDashboard className="w-4 h-4" />
          Unified Station & Division Command Dashboard
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Command Center - OCS & OCPD</h1>
        <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setMode('ocs')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'ocs' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>Station View (OCS Mode)</button>
          <button onClick={() => setMode('ocpd')} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'ocpd' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>Division View (OCPD Mode)</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={exportAuditCSV} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"><FileDown className="w-4 h-4" />Export CSV</button>
        <button onClick={exportAuditPDF} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"><FileText className="w-4 h-4" />Export PDF</button>
      </div>

      {mode === 'ocs' ? (
        <OCSView inCustody={inCustody} avgTime={avgTime} pendingBailCount={pendingBail.length} impendingViolations={impendingViolations} stationName="Chuka Police Station" onManualRelease={handleManualRelease} lawModal={lawModal} setLawModal={setLawModal} />
      ) : (
        <OCPDView detainees={detainees} transfers={transfers} stations={stations} onAcceptTransfer={handleAcceptTransfer} onCompleteTransfer={handleCompleteTransfer} transferStatusBadge={transferStatusBadge} />
      )}

      {/* Audit Trail */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-bold">Audit Trail Log</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-300"><Lock className="w-3.5 h-3.5" />Uneditable</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0"><tr className="bg-slate-100 text-slate-800 text-left">
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">User</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Officer No.</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Terminal IP</th>
              <th className="px-4 py-3 font-semibold hidden xl:table-cell">Prev State</th>
              <th className="px-4 py-3 font-semibold hidden xl:table-cell">New State</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {auditTrail.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{new Date(entry.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-4 py-2.5 text-slate-800 text-xs">{entry.action}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 hidden sm:table-cell">{entry.user}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 hidden lg:table-cell font-mono">{entry.officerServiceNo || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 hidden lg:table-cell font-mono">{entry.terminalIP || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 hidden xl:table-cell">{entry.prevState || 'N/A'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-700 hidden xl:table-cell font-semibold">{entry.newState || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accept Transfer Modal */}
      <Modal open={!!acceptTransferModal} onClose={() => setAcceptTransferModal(null)} title="Accept Incoming Transfer"
        footer={<><button onClick={() => setAcceptTransferModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Decline</button>
        <button onClick={confirmAcceptTransfer} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2"><Check className="w-4 h-4" />Accept Transfer</button></>}>
        {acceptTransferModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ArrowRightLeft className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">Transfer Request for {acceptTransferModal.detaineeName}</p>
                <p className="text-xs text-slate-500 font-mono">OB: {acceptTransferModal.obNumber}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 space-y-1">
              <p>From: <span className="font-semibold">{stations.find((s) => s.id === acceptTransferModal.fromStation)?.name}</span></p>
              <p>To: <span className="font-semibold">{stations.find((s) => s.id === acceptTransferModal.toStation)?.name}</span></p>
              <p>Requested by: <span className="font-semibold">{acceptTransferModal.requestedBy}</span></p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <Phone className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700">By accepting, the detainee's details will be sent into your station's cell ledger. The transfer will be marked as accepted and ready for processing.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Release Modal */}
      <Modal open={!!manualReleaseModal} onClose={() => setManualReleaseModal(null)} title="Senior Manual Bail Release Override"
        footer={<><button onClick={() => setManualReleaseModal(null)} className="px-4 py-2 text-slate-700 font-medium rounded-lg hover:bg-slate-100">Cancel</button>
        <button onClick={confirmManualRelease} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg">Authorize Release</button></>}>
        {manualReleaseModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Senior Override - Manual Release</p>
                <p className="text-xs text-red-600">For: {manualReleaseModal.detainee.fullName} ({manualReleaseModal.detainee.obNumber})</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-slate-700">
              <p>This action is used when bail payment processing has failed. The senior officer manually authorizes the release by providing their details and a reason. This will be permanently recorded in the audit trail.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senior Officer Name *</label>
              <input type="text" value={manualReleaseModal.seniorName} onChange={(e) => setManualReleaseModal({ ...manualReleaseModal, seniorName: e.target.value })} placeholder="e.g. OCS Samuel Gitau" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senior Officer Service No. *</label>
              <input type="text" value={manualReleaseModal.seniorServiceNo} onChange={(e) => setManualReleaseModal({ ...manualReleaseModal, seniorServiceNo: e.target.value })} placeholder="e.g. 2341" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Manual Override *</label>
              <textarea value={manualReleaseModal.reason} onChange={(e) => setManualReleaseModal({ ...manualReleaseModal, reason: e.target.value })} placeholder="Explain why the payment failed and why manual release is authorized..." rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function OCSView({ inCustody, avgTime, pendingBailCount, impendingViolations, stationName, onManualRelease, lawModal, setLawModal }) {
  return (
    <div className="space-y-6">
      {impendingViolations.length > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3 animate-flash-red">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div><p className="font-bold text-sm">HIGH PRIORITY ALERT - Statutory Violation Risk</p><p className="text-xs text-red-100">{impendingViolations.length} detainee(s) have exceeded 18 hours in custody without court date or bail release at {stationName}.</p></div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total in Cells" value={inCustody.length} color="blue" />
        <MetricCard icon={Clock} label="Avg Time in Custody" value={formatDuration(avgTime)} color="navy" />
        <MetricCard icon={Check} label="Pending Bail Approvals" value={pendingBailCount} color="yellow" />
        <MetricCard icon={AlertTriangle} label="Impending Violations (>18h)" value={impendingViolations.length} color="red" />
      </div>
      <div>
        <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Clock className="w-5 h-5" />Live Station Timer Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inCustody.map((d) => {
            const hours = getHoursHeld(d.bookingDate)
            const color = getTimerColor(hours)
            const cardClass = { green: 'border-green-300 bg-green-50', yellow: 'border-yellow-300 bg-yellow-50', red: 'border-red-400 bg-red-50 animate-flash-red' }
            const labelClass = { green: 'text-green-700', yellow: 'text-yellow-700', red: 'text-red-700' }
            return (
              <div key={d.id} className={`rounded-xl border-2 p-4 ${cardClass[color]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div><p className="font-semibold text-slate-900 text-sm">{d.fullName}</p><p className="text-xs text-slate-500 font-mono">{d.obNumber}</p></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${labelClass[color]} bg-white`}>{color === 'green' ? '0-12h' : color === 'yellow' ? '12-18h' : '18-24h+'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <CountdownTimer bookingDate={d.bookingDate} />
                  <span className={`text-xs font-semibold ${labelClass[color]}`}>{formatRemaining(hours)} remaining</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">Offense: {d.offenseType} | Bail: {d.bailTerms}</div>
                <button onClick={() => setLawModal(d)} className="mt-2 w-full text-xs bg-slate-900 text-white hover:bg-slate-800 px-2 py-1.5 rounded font-medium transition-colors flex items-center justify-center gap-1"><Scale className="w-3 h-3" />View Charge Law</button>
                {d.cashBail > 0 && !d.bailPaid && (
                  <button onClick={() => onManualRelease(d)} className="mt-2 w-full text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded font-medium transition-colors">Senior Manual Release</button>
                )}
              </div>
            )
          })}
          {inCustody.length === 0 && <div className="col-span-full p-8 text-center text-slate-500 text-sm bg-white rounded-xl border border-gray-200">No detainees currently in cells.</div>}
        </div>
      </div>

      <Modal open={!!lawModal} onClose={() => setLawModal(null)} title="Legal Reference - Charge & Rights">
        {lawModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg"><Scale className="w-5 h-5 text-white" /></div>
              <div>
                <p className="font-semibold text-slate-900">{lawModal.fullName}</p>
                <p className="text-xs text-slate-500 font-mono">{lawModal.obNumber} — Charged with: {lawModal.offenseType}</p>
              </div>
            </div>
            <LegalReferencePanel offenseType={lawModal.offenseType} />
          </div>
        )}
      </Modal>
    </div>
  )
}

function OCPDView({ detainees, transfers, stations, onAcceptTransfer, onCompleteTransfer, transferStatusBadge }) {
  const stationStats = useMemo(() => {
    return stations.map((station) => {
      const stationDets = detainees.filter((d) => d.stationId === station.id)
      const inCells = stationDets.filter((d) => d.status === 'In Cells')
      const violations = inCells.filter((d) => getHoursHeld(d.bookingDate) > 18)
      const total = stationDets.length
      const compliant = total > 0 ? Math.round(((total - violations.length) / total) * 100) : 100
      return { ...station, inCells: inCells.length, violations: violations.length, total, compliant }
    })
  }, [detainees, stations])

  const pendingApprovalTransfers = transfers.filter((t) => t.status === 'Pending OCPD Approval')
  const acceptedTransfers = transfers.filter((t) => t.status === 'OCPD Accepted - Awaiting Processing')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Building2 className="w-5 h-5" />Division Overview - Tharaka Nithi County</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stationStats.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Building2 className="w-5 h-5 text-blue-700" /></div>
                <span className={`text-2xl font-bold ${s.compliant >= 90 ? 'text-green-600' : s.compliant >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{s.compliant}%</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">In Cells</span><span className="font-semibold text-slate-800">{s.inCells}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Violations</span><span className={`font-semibold ${s.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>{s.violations}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Bookings</span><span className="font-semibold text-slate-800">{s.total}</span></div>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${s.compliant >= 90 ? 'bg-green-500' : s.compliant >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.compliant}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Approval Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          <h2 className="font-bold">Inter-Station Transfer Approval</h2>
          <span className="ml-auto bg-blue-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{pendingApprovalTransfers.length} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-100 text-slate-800 text-left">
              <th className="px-4 py-3 font-semibold">Detainee</th>
              <th className="px-4 py-3 font-semibold">OB Number</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">From</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">To</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => {
                const fromStation = stations.find((s) => s.id === t.fromStation)
                const toStation = stations.find((s) => s.id === t.toStation)
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{t.detaineeName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{t.obNumber}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-600">{fromStation?.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-600">{toStation?.name}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${transferStatusBadge(t.status)}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      {t.status === 'Pending OCPD Approval' && (
                        <button onClick={() => onAcceptTransfer(t)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Accept</button>
                      )}
                      {t.status === 'OCPD Accepted - Awaiting Processing' && (
                        <button onClick={() => onCompleteTransfer(t.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" />Complete Transfer</button>
                      )}
                      {(t.status === 'Completed' || t.status === 'Approved') && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end"><Check className="w-3.5 h-3.5" />{t.approvedBy || t.acceptedBy}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {transfers.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No transfer requests.</div>}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-700 border-blue-200', navy: 'bg-slate-50 text-slate-700 border-slate-200', yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200', red: 'bg-red-50 text-red-700 border-red-200' }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.navy}`}>
      <div className="flex items-center justify-between mb-2"><Icon className="w-5 h-5 opacity-70" /></div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
    </div>
  )
}
