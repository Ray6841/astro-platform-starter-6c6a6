import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import Login from './pages/Login'
import PickList from './pages/PickList'
import Scan from './pages/Scan'
import Reports from './pages/Reports'

function ProtectedRoute({ children, roles }: { children: React.ReactElement, roles?: Array<'ADMIN'|'MANAGER'|'STAFF'> }) {
  const { token, user } = useAuthStore()
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function Sidebar() {
  const { user, logout } = useAuthStore()
  return (
    <aside className="fixed left-0 top-0 h-full w-[var(--sidebar-width)] bg-gray-900 text-white p-4 space-y-4">
      <h1 className="text-xl font-bold">WMS</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/" className="hover:bg-gray-800 rounded px-3 py-2">Dashboard</Link>
        <Link to="/inventory" className="hover:bg-gray-800 rounded px-3 py-2">Inventory</Link>
        <Link to="/orders" className="hover:bg-gray-800 rounded px-3 py-2">Orders</Link>
        <Link to="/scan" className="hover:bg-gray-800 rounded px-3 py-2">Scan</Link>
        <Link to="/reports" className="hover:bg-gray-800 rounded px-3 py-2">Reports</Link>
        <a href="/api/docs" className="hover:bg-gray-800 rounded px-3 py-2">API Docs</a>
      </nav>
      {user && (
        <div className="absolute bottom-4 left-4 right-4 text-sm">
          <div className="mb-2">{user.email} ({user.role})</div>
          <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Logout</button>
        </div>
      )}
    </aside>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] p-6">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute roles={['ADMIN','MANAGER']}><Layout><Inventory /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={['ADMIN','MANAGER','STAFF']}><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="/orders/:id/picklist" element={<ProtectedRoute roles={['ADMIN','MANAGER','STAFF']}><Layout><PickList /></Layout></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute roles={['ADMIN','MANAGER','STAFF']}><Layout><Scan /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['ADMIN','MANAGER']}><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
