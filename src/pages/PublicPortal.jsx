import { useState } from 'react'
import { Search, MapPin, Phone, Calendar, FileText, Printer, Shield, Scale, Info, User, Gavel, CheckCircle2, XCircle } from 'lucide-react'
import { useData } from '../data/DataContext'

export default function PublicPortal() {
  const { detainees, stations, officers } = useData()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    setSearched(true)
    const q = query.trim().toLowerCase()
    const found = detainees.find(
      (d) => d.idNumber.toLowerCase() === q || d.obNumber.toLowerCase() === q
    )
    setResult(found || null)
  }

  const handlePrint = () => {
    window.print()
  }

  const station = result ? stations.find((s) => s.id === result.stationId) : null
  const officer = result ? officers[result.arrestingOfficerServiceNo] : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Shield className="w-4 h-4" />
          Public Inquiry Portal - No Login Required
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Check Custody Status</h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Search for a detained person by National ID / Passport Number or OB Tracking Number.
          This portal enforces transparency under Article 49 of the Kenyan Constitution.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter National ID / Passport or OB Number (e.g. 29837465 or OB-45/22/09/2026)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Try test ID: <span className="font-mono font-semibold">29837465</span> or OB: <span className="font-mono font-semibold">OB-45/22/09/2026</span></p>
        </div>
      </form>

      {searched && !result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No Record Found</h3>
          <p className="text-sm text-slate-500">No custody record matches your search. Please verify the number and try again.</p>
        </div>
      )}

      {result && station && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
          <div className="bg-slate-900 text-white p-5 flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Custody Record Found</h2>
              <p className="text-xs text-slate-300">Article 49 - Constitutional Custody Tracking</p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
              result.status === 'In Cells' ? 'bg-yellow-500 text-yellow-950' :
              result.status === 'Released on Bail' ? 'bg-green-500 text-green-950' :
              'bg-blue-500 text-blue-950'
            }`}>
              {result.status}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Detainee Identity Confirmation */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-slate-700" />
                <p className="text-sm font-bold text-slate-900">Detainee Identity Confirmation</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Full Name</p>
                  <p className="text-base font-bold text-slate-900">{result.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">ID / Passport Number</p>
                  <p className="text-base font-bold text-slate-900 font-mono">{result.idNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Gender</p>
                  <p className="text-sm font-semibold text-slate-800">{result.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Age</p>
                  <p className="text-sm font-semibold text-slate-800">{result.age} years</p>
                </div>
              </div>
            </div>

            {/* OB Number */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">OB Tracking Number</p>
                <p className="text-lg font-bold text-slate-900 font-mono">{result.obNumber}</p>
              </div>
            </div>

            {/* Booking & Station Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={MapPin} label="Holding Station" value={station.name} />
              <InfoRow icon={Calendar} label="Booking Date & Time" value={new Date(result.bookingDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} />
              <InfoRow icon={FileText} label="Offense Category" value={result.offenseType} />
              <InfoRow icon={Scale} label="Cash Bail Status" value={result.bailTerms} highlight={result.bailTerms === 'Non-Bailable' ? 'red' : 'green'} />
              <InfoRow icon={Phone} label="Desk Duty Contact" value={station.phone} />
              <InfoRow icon={MapPin} label="Station Address" value={station.address} />
            </div>

            {/* Arresting Officer */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-700" />
                <p className="text-sm font-bold text-slate-900">Arresting Officer</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Officer Name</p>
                  <p className="text-sm font-semibold text-slate-900">{officer ? officer.name : 'Officer #' + result.arrestingOfficerServiceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rank</p>
                  <p className="text-sm font-semibold text-slate-800">{officer ? officer.rank : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Service Number</p>
                  <p className="text-sm font-semibold text-slate-800 font-mono">#{result.arrestingOfficerServiceNo}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Attached Station</p>
                  <p className="text-sm font-semibold text-slate-800">{officer ? stations.find((s) => s.id === officer.stationId)?.name : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Criminal History */}
            <div className={`rounded-lg p-4 border ${result.priorConvictions > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Gavel className={`w-5 h-5 ${result.priorConvictions > 0 ? 'text-red-700' : 'text-green-700'}`} />
                <p className="text-sm font-bold text-slate-900">Criminal History & Conviction Record</p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {result.priorConvictions > 0 ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    {result.priorConvictions} Prior Conviction{result.priorConvictions > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    No Prior Convictions - First-time Offender
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{result.convictionDetails}</p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-slate-50 rounded-lg p-4 flex items-start gap-3 border border-slate-200">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Privacy Safeguard</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arresting officer personal contact details and home addresses are withheld from public view in accordance with data protection regulations.
                </p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors print:hidden"
            >
              <Printer className="w-5 h-5" />
              Print / Save PDF Receipt
            </button>
          </div>
        </div>
      )}

      {!searched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <FeatureCard icon={Scale} title="Constitutional Rights" text="Article 49 guarantees the right to be brought before court within 24 hours." />
          <FeatureCard icon={Shield} title="Public Transparency" text="Family and public can verify custody status without requiring login credentials." />
          <FeatureCard icon={Phone} title="Next-of-Kin Notification" text="Automatic SMS alerts sent to next-of-kin upon booking at the station." />
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, highlight }) {
  const highlightClass = highlight === 'red' ? 'text-red-700 font-bold' : highlight === 'green' ? 'text-green-700 font-bold' : 'text-slate-900 font-semibold'
  return (
    <div className="flex items-start gap-3">
      <div className="bg-slate-100 p-2 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm ${highlightClass}`}>{value}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="bg-blue-100 p-2.5 rounded-lg w-fit mb-3">
        <Icon className="w-5 h-5 text-blue-700" />
      </div>
      <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-600">{text}</p>
    </div>
  )
}
