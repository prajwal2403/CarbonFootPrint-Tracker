import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import LogActivity from './pages/LogActivity'
import Reports from './pages/Reports'

// Simple icon components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
)

const LogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const LeafIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
  </svg>
)

function Layout({ children }) {
  return (
    <div className="min-h-screen fade-in">
      <header className="sticky top-0 z-20 glass-effect backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 grid place-items-center text-white shadow-lg shadow-emerald-500/25">
              <LeafIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Carbon Tracker
              </h1>
              <p className="text-sm text-slate-500 font-medium">Track your environmental impact</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <NavLink 
              className={({isActive}) => isActive ? 'nav-link nav-link-active' : 'nav-link'} 
              to="/"
            >
              <DashboardIcon />
              Dashboard
            </NavLink>
            <NavLink 
              className={({isActive}) => isActive ? 'nav-link nav-link-active' : 'nav-link'} 
              to="/log"
            >
              <LogIcon />
              Log Activity
            </NavLink>
            <NavLink 
              className={({isActive}) => isActive ? 'nav-link nav-link-active' : 'nav-link'} 
              to="/reports"
            >
              <ReportsIcon />
              Reports
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 slide-up">
        {children}
      </main>
      <footer className="text-center text-sm text-slate-400 py-12 bg-gradient-to-t from-slate-50 to-transparent">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LeafIcon />
          <span className="font-semibold">Carbon Tracker</span>
        </div>
        <p>© {new Date().getFullYear()} Making the world greener, one step at a time</p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogActivity />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
