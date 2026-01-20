import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Reservations from './pages/Reservations'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminVehicles from './pages/admin/Vehicles'
import AdminReservations from './pages/admin/Reservations'
import EmployeeDashboard from './pages/EmployeeDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <PrivateRoute requiredRole="EMPLOYEE">
                <Vehicles />
              </PrivateRoute>
            }
          />

          <Route
            path="/reservations"
            element={
              <PrivateRoute requiredRole="EMPLOYEE">
                <Reservations />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="EMPLOYEE">
                <EmployeeDashboard />
              </PrivateRoute>
            }
          />

          {/* Routes Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminUsers />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/vehicles"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminVehicles />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/reservations"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminReservations />
              </PrivateRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App