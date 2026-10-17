import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { STATIONS, OFFICERS, OFFENSE_TYPES, AUTH_USERS, generateMockDetainees, generateMockTransfers, generateMockAuditTrail, generateMockBreachLog } from './mockData'

const DataContext = createContext(null)

const STORAGE_KEY = 'pcaams_data_v3'
const AUTH_KEY = 'pcaams_auth_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      parsed.detainees = parsed.detainees.map((d) => ({ ...d, bookingDate: new Date(d.bookingDate) }))
      parsed.transfers = parsed.transfers.map((t) => ({ ...t, requestedAt: new Date(t.requestedAt), ocpdNotifiedAt: t.ocpdNotifiedAt ? new Date(t.ocpdNotifiedAt) : null, acceptedAt: t.acceptedAt ? new Date(t.acceptedAt) : null }))
      parsed.auditTrail = parsed.auditTrail.map((a) => ({ ...a, timestamp: new Date(a.timestamp) }))
      parsed.breachLog = (parsed.breachLog || []).map((b) => ({ ...b, loggedAt: new Date(b.loggedAt) }))
      return parsed
    }
  } catch (e) {
    // fall through
  }
  return null
}

function loadAuthFromStorage() {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // fall through
  }
  return null
}

export function DataProvider({ children }) {
  const [detainees, setDetainees] = useState([])
  const [transfers, setTransfers] = useState([])
  const [auditTrail, setAuditTrail] = useState([])
  const [breachLog, setBreachLog] = useState([])
  const [toasts, setToasts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [shiftActive, setShiftActive] = useState(false)
  const [shiftOfficer, setShiftOfficer] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [pendingSms, setPendingSms] = useState(null)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      setDetainees(stored.detainees)
      setTransfers(stored.transfers)
      setAuditTrail(stored.auditTrail)
      setBreachLog(stored.breachLog)
    } else {
      setDetainees(generateMockDetainees())
      setTransfers(generateMockTransfers())
      setAuditTrail(generateMockAuditTrail())
      setBreachLog(generateMockBreachLog())
    }
    setCurrentUser(loadAuthFromStorage())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        detainees: detainees.map((d) => ({ ...d, bookingDate: d.bookingDate.toISOString() })),
        transfers: transfers.map((t) => ({
          ...t,
          requestedAt: t.requestedAt.toISOString(),
          ocpdNotifiedAt: t.ocpdNotifiedAt ? t.ocpdNotifiedAt.toISOString() : null,
          acceptedAt: t.acceptedAt ? t.acceptedAt.toISOString() : null,
        })),
        auditTrail: auditTrail.map((a) => ({ ...a, timestamp: a.timestamp.toISOString() })),
        breachLog: breachLog.map((b) => ({ ...b, loggedAt: b.loggedAt.toISOString() })),
      })
    )
  }, [detainees, transfers, auditTrail, breachLog, loaded])

  useEffect(() => {
    if (currentUser) localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser))
    else localStorage.removeItem(AUTH_KEY)
  }, [currentUser])

  const addToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const addAuditEntry = useCallback((action, user, details = {}) => {
    setAuditTrail((prev) => [{
      id: `aud-${Date.now()}`,
      action, timestamp: new Date(), user,
      officerServiceNo: details.officerServiceNo || 'N/A',
      terminalIP: details.terminalIP || '10.0.1.01',
      prevState: details.prevState || 'N/A',
      newState: details.newState || 'N/A',
    }, ...prev])
  }, [])

  const login = useCallback((username) => {
    const user = AUTH_USERS.find((u) => u.username === username)
    if (user) {
      const session = { username: user.username, role: user.role, name: user.name, serviceNo: user.serviceNo }
      setCurrentUser(session)
      addAuditEntry(`${user.name} logged in via identifier authentication`, user.name, { officerServiceNo: user.serviceNo, prevState: 'Logged out', newState: `Logged in (${user.role})` })
      return { success: true, role: user.role, name: user.name, requiresSms: false }
    }
    return { success: false }
  }, [addAuditEntry])

  const requestSmsCode = useCallback((username) => {
    const user = AUTH_USERS.find((u) => u.username === username)
    if (!user) return { success: false }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setPendingSms({ username, code, requestedAt: Date.now() })
    addAuditEntry(`SMS verification code sent to ${user.name} (${user.role}) for two-factor authentication`, user.name, { officerServiceNo: user.serviceNo, prevState: 'Identity Selected', newState: 'Awaiting SMS Verification' })
    return { success: true, phone: user.phone, code }
  }, [addAuditEntry])

  const verifySmsLogin = useCallback((username, code) => {
    if (!pendingSms || pendingSms.username !== username) return { success: false, message: 'No verification code was requested. Start again.' }
    if (Date.now() - pendingSms.requestedAt > 5 * 60 * 1000) {
      setPendingSms(null)
      return { success: false, message: 'Verification code expired. Request a new one.' }
    }
    if (pendingSms.code !== code.trim()) return { success: false, message: 'Incorrect verification code. Please try again.' }
    const user = AUTH_USERS.find((u) => u.username === username)
    if (!user) return { success: false, message: 'Unknown user' }
    setPendingSms(null)
    const session = { username: user.username, role: user.role, name: user.name, serviceNo: user.serviceNo }
    setCurrentUser(session)
    addAuditEntry(`${user.name} logged in via SMS two-factor authentication`, user.name, { officerServiceNo: user.serviceNo, prevState: 'Awaiting SMS Verification', newState: `Logged in (${user.role})` })
    return { success: true, role: user.role, name: user.name }
  }, [pendingSms, addAuditEntry])

  const sessionTimeoutMinutes = currentUser && (currentUser.role === 'ocpd' || currentUser.role === 'ipoa') ? 5 : 15

  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now() }
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, updateActivity))
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > sessionTimeoutMinutes * 60 * 1000) {
        const expired = currentUser
        addAuditEntry(`${expired.name} automatically signed out after ${sessionTimeoutMinutes} minutes of inactivity`, expired.name, { officerServiceNo: expired.serviceNo, prevState: `Logged in (${expired.role})`, newState: 'Session Expired (Inactivity)' })
        setCurrentUser(null)
        addToast(`Session expired after ${sessionTimeoutMinutes} minutes of inactivity. Please sign in again.`, 'error')
        lastActivityRef.current = Date.now()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [currentUser, sessionTimeoutMinutes, addAuditEntry, addToast])

  const logout = useCallback(() => {
    if (currentUser) {
      addAuditEntry(`${currentUser.name} logged out`, currentUser.name, { officerServiceNo: currentUser.serviceNo, prevState: `Logged in (${currentUser.role})`, newState: 'Logged out' })
    }
    setCurrentUser(null)
  }, [currentUser, addAuditEntry])

  const activateShift = useCallback((serviceNo, shiftCode) => {
    const officer = OFFICERS[serviceNo]
    if (officer && shiftCode === 'OCS-2026') {
      setShiftActive(true)
      setShiftOfficer(officer)
      addAuditEntry(`Shift activated for Officer #${serviceNo} (${officer.name}) - elevated to Desk Booking Officer`, `OCS ${officer.stationId}`, { officerServiceNo: serviceNo, prevState: 'FIELD_OFFICER', newState: 'DESK_BOOKING_OFFICER' })
      return true
    }
    return false
  }, [addAuditEntry])

  const deactivateShift = useCallback(() => {
    if (shiftOfficer) {
      addAuditEntry(`Shift ended for Officer #${shiftOfficer.serviceNo} - session reverted to read-only`, `OCS ${shiftOfficer.stationId}`, { officerServiceNo: shiftOfficer.serviceNo, prevState: 'DESK_BOOKING_OFFICER', newState: 'FIELD_OFFICER' })
    }
    setShiftActive(false)
    setShiftOfficer(null)
  }, [shiftOfficer, addAuditEntry])

  const addDetainee = useCallback((data) => {
    const station = STATIONS.find((s) => s.id === data.stationId)
    const obNumber = generateOBNumber(data.stationId)
    const newDetainee = { ...data, id: `det-${Date.now()}`, obNumber, bookingDate: new Date(), status: 'In Cells', courtDate: null, transferTo: null, bailPaid: false, bailPaymentRef: null }
    setDetainees((prev) => [newDetainee, ...prev])
    addAuditEntry(`Officer #${data.arrestingOfficerServiceNo} created ${obNumber} at ${formatTime(new Date())}`, `Desk Officer #${data.arrestingOfficerServiceNo}`, { officerServiceNo: data.arrestingOfficerServiceNo, terminalIP: '10.0.1.14', prevState: 'N/A', newState: 'In Cells' })
    return { newDetainee, obNumber, station }
  }, [addAuditEntry])

  const updateDetaineeStatus = useCallback((id, status, extra = {}) => {
    setDetainees((prev) => prev.map((d) => {
      if (d.id === id) {
        if (status === 'In Cells' && getHoursHeld(d.bookingDate) > 24) {
          setBreachLog((bl) => [{ id: `brh-${Date.now()}`, detaineeName: d.fullName, obNumber: d.obNumber, stationId: d.stationId, hoursHeld: getHoursHeld(d.bookingDate), breachType: 'Statutory Breach (>24h)', status: 'Active - Constitutional violation', loggedAt: new Date() }, ...bl])
        }
        return { ...d, status, ...extra }
      }
      return d
    }))
  }, [])

  // --- BAIL WORKFLOW ---
  const processBailPayment = useCallback((detaineeId, paymentMethod, paymentRef) => {
    const detainee = detainees.find((d) => d.id === detaineeId)
    if (!detainee) return { success: false }
    if (detainee.cashBail === 0 || detainee.bailTerms === 'Non-Bailable') {
      return { success: false, message: 'This detainee is non-bailable' }
    }
    setDetainees((prev) => prev.map((d) => d.id === detaineeId ? { ...d, bailPaid: true, bailPaymentRef: paymentRef, bailPaymentMethod: paymentMethod, bailPaidAt: new Date().toISOString() } : d))
    addAuditEntry(`Bail payment received for ${detainee.obNumber} - KES ${detainee.cashBail.toLocaleString()} via ${paymentMethod} (Ref: ${paymentRef})`, currentUser?.name || 'System', { prevState: 'In Cells (Bail Pending)', newState: 'In Cells (Bail Paid)' })
    return { success: true }
  }, [detainees, addAuditEntry, currentUser])

  const releaseOnBail = useCallback((detaineeId) => {
    const detainee = detainees.find((d) => d.id === detaineeId)
    if (!detainee) return { success: false }
    if (!detainee.bailPaid) return { success: false, message: 'Bail has not been paid yet. Release blocked.' }
    updateDetaineeStatus(detaineeId, 'Released on Bail', { releasedAt: new Date().toISOString() })
    addAuditEntry(`Detainee ${detainee.fullName} (${detainee.obNumber}) released on bail - payment confirmed`, currentUser?.name || 'Desk Officer', { prevState: 'In Cells (Bail Paid)', newState: 'Released on Bail' })
    addToast(`${detainee.fullName} released on bail - payment confirmed`, 'success')
    return { success: true }
  }, [detainees, updateDetaineeStatus, addAuditEntry, addToast, currentUser])

  const seniorManualRelease = useCallback((detaineeId, releaseDetails) => {
    const detainee = detainees.find((d) => d.id === detaineeId)
    if (!detainee) return { success: false }
    updateDetaineeStatus(detaineeId, 'Released on Bail', {
      releasedAt: new Date().toISOString(),
      bailPaid: true,
      bailPaymentRef: `MANUAL-${releaseDetails.seniorServiceNo}`,
      manualReleaseReason: releaseDetails.reason,
      manualReleaseBy: releaseDetails.seniorName,
    })
    addAuditEntry(`SENIOR OVERRIDE: ${releaseDetails.seniorName} manually released ${detainee.fullName} (${detainee.obNumber}). Reason: ${releaseDetails.reason}`, releaseDetails.seniorName, { officerServiceNo: releaseDetails.seniorServiceNo, prevState: 'In Cells', newState: 'Released on Bail (Manual Override)' })
    addToast(`Senior manual release processed for ${detainee.fullName}`, 'success')
    return { success: true }
  }, [detainees, updateDetaineeStatus, addAuditEntry, addToast])

  // --- TRANSFER WORKFLOW ---
  const initiateTransfer = useCallback((detaineeId, toStationId, requesterName) => {
    const detainee = detainees.find((d) => d.id === detaineeId)
    if (!detainee) return { success: false }
    const toStation = STATIONS.find((s) => s.id === toStationId)
    const newTransfer = {
      id: `trf-${Date.now()}`,
      detaineeId: detainee.id,
      detaineeName: detainee.fullName,
      obNumber: detainee.obNumber,
      fromStation: detainee.stationId,
      toStation: toStationId,
      status: 'Pending OCPD Approval',
      requestedAt: new Date(),
      requestedBy: requesterName,
      ocpdNotifiedAt: new Date(),
      ocpdAccepted: false,
      acceptedAt: null,
      acceptedBy: null,
      approvedBy: null,
    }
    setTransfers((prev) => [newTransfer, ...prev])
    addAuditEntry(`Transfer request initiated for ${detainee.obNumber} (${STATIONS.find((s) => s.id === detainee.stationId)?.name} → ${toStation?.name}). OCPD of destination station notified.`, requesterName, { prevState: 'In Cells', newState: 'Transfer Pending OCPD Approval' })
    addToast(`Transfer request sent to OCPD of ${toStation?.name}. Awaiting acceptance.`, 'info')
    return { success: true, transfer: newTransfer }
  }, [detainees, addAuditEntry, addToast])

  const ocpdAcceptTransfer = useCallback((transferId, accepterName) => {
    setTransfers((prev) => prev.map((t) => t.id === transferId ? { ...t, status: 'OCPD Accepted - Awaiting Processing', ocpdAccepted: true, acceptedAt: new Date(), acceptedBy: accepterName } : t))
    const transfer = transfers.find((t) => t.id === transferId)
    if (transfer) {
      const toStation = STATIONS.find((s) => s.id === transfer.toStation)
      addAuditEntry(`OCPD accepted transfer for ${transfer.obNumber} from ${STATIONS.find((s) => s.id === transfer.fromStation)?.name}. Detainee details sent to ${toStation?.name} cells.`, accepterName, { prevState: 'Pending OCPD Approval', newState: 'OCPD Accepted - Detainee details sent to receiving station' })
      addToast(`Transfer accepted. Detainee details sent to ${toStation?.name}.`, 'success')
    }
  }, [transfers, addAuditEntry, addToast])

  const completeTransfer = useCallback((transferId, approverName) => {
    setTransfers((prev) => prev.map((t) => t.id === transferId ? { ...t, status: 'Completed', approvedBy: approverName, completedAt: new Date() } : t))
    const transfer = transfers.find((t) => t.id === transferId)
    if (transfer) {
      setDetainees((prev) => prev.map((d) => d.id === transfer.detaineeId ? { ...d, status: 'Transferred', transferTo: transfer.toStation, stationId: transfer.toStation, previousStationId: d.stationId } : d))
      addAuditEntry(`Transfer completed for ${transfer.obNumber} - detainee moved to ${STATIONS.find((s) => s.id === transfer.toStation)?.name} cells`, approverName, { prevState: 'OCPD Accepted', newState: 'Transferred' })
      addToast(`Transfer completed. Detainee now in receiving station cells.`, 'success')
    }
  }, [transfers, addAuditEntry, addToast])

  const approveTransfer = useCallback((transferId, approver) => {
    setTransfers((prev) => prev.map((t) => t.id === transferId ? { ...t, status: 'Approved', approvedBy: approver } : t))
    const transfer = transfers.find((t) => t.id === transferId)
    if (transfer) {
      setDetainees((prev) => prev.map((d) => d.obNumber === transfer.obNumber ? { ...d, status: 'Transferred', transferTo: transfer.toStation } : d))
      addAuditEntry(`OCPD approved transfer for ${transfer.obNumber} (${transfer.fromStation} → ${transfer.toStation})`, approver, { terminalIP: '10.0.0.01', prevState: 'In Cells', newState: 'Transferred' })
    }
  }, [transfers, addAuditEntry])

  const exportAuditCSV = useCallback(() => {
    const headers = ['Timestamp', 'Action', 'User', 'Officer Service No.', 'Terminal IP', 'Previous State', 'New State']
    const rows = auditTrail.map((a) => [new Date(a.timestamp).toLocaleString('en-GB'), `"${a.action}"`, `"${a.user}"`, a.officerServiceNo || 'N/A', a.terminalIP || 'N/A', a.prevState || 'N/A', a.newState || 'N/A'])
    downloadFile([headers, ...rows].map((r) => r.join(',')).join('\n'), 'pcaams_audit_trail.csv', 'text/csv')
    addToast('Audit trail exported as CSV', 'success')
  }, [auditTrail, addToast])

  const exportAuditPDF = useCallback(() => {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = auditTrail.map((a) => `<tr><td style="padding:6px;border:1px solid #ddd;font-size:11px">${new Date(a.timestamp).toLocaleString('en-GB')}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.action}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.user}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.officerServiceNo || 'N/A'}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.terminalIP || 'N/A'}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.prevState || 'N/A'}</td><td style="padding:6px;border:1px solid #ddd;font-size:11px">${a.newState || 'N/A'}</td></tr>`).join('')
    win.document.write(`<html><head><title>PCAAMS Audit Trail Report</title></head><body style="font-family:Arial,sans-serif"><div style="text-align:center;margin-bottom:20px"><h1 style="margin:0">PCAAMS - Official Audit Trail Report</h1><p style="color:#666">Police Custody & Arrest Accountability Monitoring System</p><p style="color:#666">Generated: ${new Date().toLocaleString('en-GB')}</p></div><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#102a43;color:white"><th style="padding:8px;border:1px solid #ddd;font-size:12px">Timestamp</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">Action</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">User</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">Officer No.</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">Terminal IP</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">Prev State</th><th style="padding:8px;border:1px solid #ddd;font-size:12px">New State</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:20px;color:#999;font-size:10px">This document is system-generated and tamper-evident. Article 49, Constitution of Kenya.</p></body></html>`)
    win.document.close()
    win.print()
    addToast('Audit trail exported as PDF', 'success')
  }, [auditTrail, addToast])

  const value = {
    detainees, transfers, auditTrail, breachLog, stations: STATIONS, officers: OFFICERS, offenseTypes: OFFENSE_TYPES,
    toasts, addToast, removeToast, addAuditEntry, addDetainee, updateDetaineeStatus,
    approveTransfer, exportAuditCSV, exportAuditPDF,
    shiftActive, shiftOfficer, activateShift, deactivateShift,
    currentUser, login, logout, requestSmsCode, verifySmsLogin, sessionTimeoutMinutes,
    processBailPayment, releaseOnBail, seniorManualRelease,
    initiateTransfer, ocpdAcceptTransfer, completeTransfer,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

function generateOBNumber(stationId) {
  const now = new Date()
  const seq = Math.floor(Math.random() * 99) + 1
  return `OB-${seq}/${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
}

function formatTime(date) {
  let h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

function getHoursHeld(bookingDate) {
  return (Date.now() - new Date(bookingDate).getTime()) / (3600 * 1000)
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
