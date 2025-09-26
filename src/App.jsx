import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { SidebarProvider, useSidebar } from './contexts/SidebarContext'
import Sidebar from './components/Sidebar'
import ConnectionStatus from './components/ConnectionStatus'
import { runApiTests } from './utils/apiTest'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Competitions from './pages/Competitions'
import Workshops from './pages/Workshops'
import Participants from './pages/Participants'
import Messages from './pages/Messages'
import Gallery from './pages/Gallery'
import Results from './pages/Results'

const AppContent = () => {
  const { isOpen } = useSidebar()
  const { user, loading, logout } = useAuth()
  
  // Run API connectivity tests on mount
  React.useEffect(() => {
    console.log('🧪 Running API tests...');
    runApiTests();
  }, []);
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }
  
  // Show auth pages if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-100 w-full min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 
        ${isOpen ? 'ml-64' : 'ml-16'}`}>
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 w-full">
          <div className="flex items-center justify-between w-full max-w-none">
            <h1 className="text-2xl font-bold text-gray-800">Festie Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user.name || user.email}</span>
              <button 
                onClick={logout} 
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 w-full">
          <div className="w-full max-w-none">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/participants" element={<Participants />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <ConnectionStatus />
          <AppContent />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
