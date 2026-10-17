import { useMemo } from 'react'
import { Eye, AlertTriangle, Clock, Building2, FileDown, FileText, Lock, History, ShieldAlert } from 'lucide-react'
import { useData } from '../data/DataContext'
import { getHoursHeld, getTimerColor, formatDuration } from '../components/CountdownTimer'

export default function IPOADashboard() {
  const { detainees, stations, breachLog, auditTrail, exportAuditCSV, exportAuditPDF } = useData()

  const stationStats = useMemo(() => {
    return stations.map((station) => {
      const stationDets = detainees.filter((d) => d.stationId === station.id)
      const inCells = stationDets.filter((d) => d.status === 'In Cells')
      const violations = inCells.filter((d) => getHoursHeld(d.bookingDate) > 18)
      const breaches = inCells.filter((d) => getHoursHeld(d.bookingDate) > 24)
      const compliant = stationDets.length > 0 ? Math.round(((stationDets.length - violations.length) / stationDets.length) * 100) : 100
      return { ...station, inCells: inCells.length, violations: violations.length, breaches: breaches.length, total: stationDets.length, compliant }
    })
  }, [detainees, stations])

  const allInCustody = detainees.filter((d) => d.status === 'In Cells')
  const totalViolations = allInCustody.filter((d) => getHoursHeld(d.bookingDate) > 18).length
  const totalBreaches = allInCustody.filter((d) => getHoursHeld(d.bookingDate) > 24).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <Eye className="w-4 h-4" />
          IPOA Oversight Dashboard - Regional Civilian Inspection
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Independent Policing Oversight Authority</h1>
        <p className="text-sm text-slate-600">
          Regional read-only access to active cell timers and detention metrics. Statutory breach tracking and legal evidence export.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={exportAuditCSV} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <FileDown className="w-4 h-4" />
          Export CSV
        </button>
        <button onClick={exportAuditPDF} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
          <FileText className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Regional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Building2} label="Total Stations" value={stations.length} color="blue" />
        <MetricCard icon={Clock} label="Active Detainees" value={allInCustody.length} color="navy" />
        <MetricCard icon={AlertTriangle} label="Violations (>18h)" value={totalViolations} color="yellow" />
        <MetricCard icon={ShieldAlert} label="Statutory Breaches (>24h)" value={totalBreaches} color="red" />
      </div>

      {/* Statutory Breach Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-red-700 text-white px-5 py-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="font-bold">Statutory Breach Log - Article 49 Violations</h2>
          <span className="ml-auto bg-red-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">{breachLog.length} logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-left">
                <th className="px-4 py-3 font-semibold">Detainee</th>
                <th className="px-4 py-3 font-semibold">OB Number</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Station</th>
                <th className="px-4 py-3 font-semibold">Hours Held</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Breach Type</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {breachLog.map((b) => {
                const station = stations.find((s) => s.id === b.stationId)
                return (
                  <tr key={b.id} className="hover:bg-slate-50 bg-red-50/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 text-xs">{b.detaineeName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{b.obNumber}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-slate-600">{station?.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-red-700">{b.hoursHeld.toFixed(1)}h</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">{b.breachType}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-600">{b.status}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-slate-500">
                      {new Date(b.loggedAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {breachLog.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No statutory breaches logged.</div>}
        </div>
      </div>

      {/* Station Compliance Grid */}
      <div className="mb-6">
        <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Regional Station Compliance Grid
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stationStats.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
                <span className={`text-2xl font-bold ${s.compliant >= 90 ? 'text-green-600' : s.compliant >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{s.compliant}%</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">In Cells</span><span className="font-semibold text-slate-800">{s.inCells}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Violations</span><span className={`font-semibold ${s.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>{s.violations}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Breaches</span><span className={`font-semibold ${s.breaches > 0 ? 'text-red-600' : 'text-green-600'}`}>{s.breaches}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold text-slate-800">{s.total}</span></div>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.compliant >= 90 ? 'bg-green-500' : s.compliant >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.compliant}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-bold">Full Audit Trail - IPOA Read-Only Access</h2>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5" />
            Uneditable
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr className="bg-slate-100 text-slate-800 text-left">
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">User</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Officer No.</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Terminal IP</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">Prev State</th>
                <th className="px-4 py-3 font-semibold hidden xl:table-cell">New State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditTrail.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
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
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    navy: 'bg-slate-50 text-slate-700 border-slate-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.navy}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 opacity-70" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-0.5">{label}</p>
    </div>
  )
}
