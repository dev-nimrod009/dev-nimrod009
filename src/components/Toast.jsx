import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useData } from '../data/DataContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useData()

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg text-white animate-slide-in-right ${colors[toast.type] || 'bg-blue-600'}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="flex-shrink-0">
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
