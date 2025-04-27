
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Index from './pages/Index'
import Auth from './pages/Auth'
import TradeLog from './pages/TradeLog'
import Analytics from './pages/Analytics'
import Import from './pages/Import'
import EditTrade from './pages/EditTrade'
import NotFound from './pages/NotFound'
import { Toaster } from './components/ui/toaster'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on initial load
  useEffect(() => {
    const authStatus = localStorage.getItem('forex_tracker_auth') === 'true';
    setIsAuthenticated(authStatus);
  }, []);
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/trade-log" element={
          <ProtectedRoute>
            <TradeLog />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/import" element={
          <ProtectedRoute>
            <Import />
          </ProtectedRoute>
        } />
        <Route path="/edit-trade/:id" element={
          <ProtectedRoute>
            <EditTrade />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
