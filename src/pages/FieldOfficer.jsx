import { useState, useMemo } from 'react'
import { Search, Shield, Lock, Ban, Clock } from 'lucide-react'
import { useData } from '../data/DataContext'
import { getHoursHeld, getTimerColor, formatDuration } from '../components/CountdownTimer'

export default function FieldOfficer() {
  const { detainees, stations } = useData()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return detainees
    return detainees.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.obNumber.toLowerCase().includes(q) ||
        d.idNumber.toLowerCase().includes(q)
    )
  }, [detainees, query])

  const statusBadge = (status) => {
    const styles = {
      'In Cells': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Released on Bail': 'bg-green-100 text-green-800 border-green-300',
      Transferred: 'bg-blue-100 text-blue-800 border-blue-300',
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
          <Shield className="w-4 h-4" />
          Field Verification Interface - Read Only
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Field Officer Dashboard</h1>
        <p className="text-sm text-slate-600">
          Verify whether an arrested suspect has been formally processed at the booking desk.
          All editing capabilities are disabled for this role.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID number, or OB number..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
        <Lock className="w-3.5 h-3.5" />
        <span>Read-only access - edit, delete, and status modification are disabled for field officers</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-4 py-3.5 font-semibold">Suspect Name</th>
                <th className="px-4 py-3.5 font-semibold">OB Number</th>
                <th className="px-4 py-3.5 font-semibold hidden lg:table-cell">Offense Summary</th>
                <th className="px-4 py-3.5 font-semibold hidden sm:table-cell">Station</th>
                <th className="px-4 py-3.5 font-semibold hidden md:table-cell">Booking Time</th>
                <th className="px-4 py-3.5 font-semibold">Time Held</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => {
                const hours = getHoursHeld(d.bookingDate)
                const color = getTimerColor(hours)
                const station = stations.find((s) => s.id === d.stationId)
                const timerColor = {
                  green: 'text-green-700',
                  yellow: 'text-yellow-700',
                  red: 'text-red-700 font-bold',
                }
                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{d.fullName}</div>
                      <div className="text-xs text-slate-500">ID: {d.idNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{d.obNumber}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">{d.offenseType}</span>
                        <span className="text-xs text-slate-600 line-clamp-2 max-w-xs">{d.offenseSummary}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{station?.name || '-'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">
                      {new Date(d.bookingDate).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${timerColor[color]}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(hours)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <Ban className="w-3.5 h-3.5" />
                        <span className="italic">No actions</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No bookings match your search.</div>
        )}
      </div>
    </div>
  )
}
