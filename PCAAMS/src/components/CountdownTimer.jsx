import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export function getHoursHeld(bookingDate) {
  return (Date.now() - new Date(bookingDate).getTime()) / (3600 * 1000)
}

export function getTimerColor(hours) {
  if (hours < 12) return 'green'
  if (hours < 18) return 'yellow'
  return 'red'
}

export function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  const s = Math.floor(((hours - h) * 60 - m) * 60)
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export function formatRemaining(hours) {
  const remaining = Math.max(0, 24 - hours)
  return formatDuration(remaining)
}

export default function CountdownTimer({ bookingDate, showRemaining = false }) {
  const [hours, setHours] = useState(getHoursHeld(bookingDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setHours(getHoursHeld(bookingDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [bookingDate])

  const color = getTimerColor(hours)

  const colorClasses = {
    green: 'bg-green-50 text-green-800 border-green-300',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    red: 'bg-red-50 text-red-800 border-red-300 animate-flash-red',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold ${colorClasses[color]}`}>
      <Clock className="w-4 h-4" />
      {showRemaining ? (
        <span>{formatRemaining(hours)} left</span>
      ) : (
        <span>{formatDuration(hours)}</span>
      )}
    </div>
  )
}
