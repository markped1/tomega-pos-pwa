import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isSetup } from './store/settings'
import SetupPage       from './pages/SetupPage'
import SalesPage       from './pages/SalesPage'
import AdminLoginPage  from './pages/AdminLoginPage'
import AdminPage       from './pages/AdminPage'
import StaffLoginPage  from './pages/StaffLoginPage'
import StaffSalesPage  from './pages/StaffSalesPage'
import ReportsPage     from './pages/ReportsPage'
import ExpensesPage    from './pages/ExpensesPage'

function RequireSetup({ children }: { children: JSX.Element }) {
  return isSetup() ? children : <Navigate to="/setup" replace />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/" element={
          <RequireSetup><SalesPage /></RequireSetup>
        } />
        <Route path="/admin-login" element={
          <RequireSetup><AdminLoginPage /></RequireSetup>
        } />
        <Route path="/admin" element={
          <RequireSetup><AdminPage /></RequireSetup>
        } />
        <Route path="/staff-login" element={
          <RequireSetup><StaffLoginPage /></RequireSetup>
        } />
        <Route path="/staff-sales" element={
          <RequireSetup><StaffSalesPage /></RequireSetup>
        } />
        <Route path="/reports" element={
          <RequireSetup><ReportsPage /></RequireSetup>
        } />
        <Route path="/expenses" element={
          <RequireSetup><ExpensesPage /></RequireSetup>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
