import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './data/DataContext'
import Navbar from './components/Navbar'
import ToastContainer from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import PublicPortal from './pages/PublicPortal'
import FieldOfficer from './pages/FieldOfficer'
import DeskOfficer from './pages/DeskOfficer'
import CommandDashboard from './pages/CommandDashboard'
import IPOADashboard from './pages/IPOADashboard'

export default function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<PublicPortal />} />
          <Route path="/field-officer" element={
            <ProtectedRoute requiredRole="field_officer" dashboardName="Field Officer Dashboard">
              <FieldOfficer />
            </ProtectedRoute>
          } />
          <Route path="/desk-officer" element={
            <ProtectedRoute requiredRole="ocs" dashboardName="OB / Desk Booking Dashboard">
              <DeskOfficer />
            </ProtectedRoute>
          } />
          <Route path="/command" element={
            <ProtectedRoute requiredRole="ocpd" dashboardName="Command Dashboard">
              <CommandDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ipoa" element={
            <ProtectedRoute requiredRole="ipoa" dashboardName="IPOA Oversight Dashboard">
              <IPOADashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </DataProvider>
  )
}
