import { Scale, BookOpen, ShieldCheck, Info } from 'lucide-react'
import { getLegalReference, CONSTITUTION_RIGHTS } from '../data/legalReference'

export default function LegalReferencePanel({ offenseType, compact }) {
  const ref = getLegalReference(offenseType)

  if (!ref) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">No statutory reference matched for "{offenseType}". Confirm the charge under the appropriate Act before production in court.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${compact ? '' : 'space-y-3'}`}>
      <div className="bg-slate-900 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-blue-400" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Charge Grounds</p>
        </div>
        <p className="text-sm font-bold text-white">{ref.title}</p>
        <p className="text-[11px] text-blue-300 font-medium mt-0.5">{ref.statute} — {ref.section}</p>
        <p className="text-xs text-slate-300 leading-relaxed mt-2">{ref.definition}</p>
        <div className="mt-2 pt-2 border-t border-slate-700">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Penalty</p>
          <p className="text-xs text-slate-300 leading-relaxed">{ref.penalty}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-amber-700" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Constitutional Rights of the Accused</p>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed"><span className="font-semibold">Bail position:</span> {ref.bailConsiderations}</p>
        <div className="mt-2 space-y-1.5">
          {CONSTITUTION_RIGHTS.map((r) => (
            <div key={r.article} className="text-[11px] leading-relaxed">
              <span className="font-bold text-amber-900">{r.article} — {r.heading}:</span>{' '}
              <span className="text-amber-800">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {!compact && (
        <p className="text-[10px] text-slate-400 flex items-start gap-1.5">
          <BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" />
          Statutory summaries are simplified for officer guidance and do not constitute legal advice. Refer to the current statute text when preferring charges.
        </p>
      )}
    </div>
  )
}
