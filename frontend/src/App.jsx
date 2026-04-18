import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TouristPage from "./components/TouristPage";
import DestinationDetails from "./components/DestinationDetails";
import Wishlist from "./components/Wishlist";
import Translator from "./components/Translator";
import CurrencyConverter from "./components/CurrencyConverter";
import Dashboard from "./components/Dashboard";
import Bookings from "./components/Bookings";
import { AuthProvider } from "./context/AuthContext";
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-white text-xl">Loading...</div>
    </div>;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/welcome" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/welcome" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Protected Routes (require authentication) */}
      <Route path="/" element={<Navigate to={user ? "/welcome" : "/login"} />} />
      <Route path="/welcome" element={
        <ProtectedRoute>
          <Welcome />
        </ProtectedRoute>
      } />
      <Route path="/tourist" element={
        <ProtectedRoute>
          <TouristPage />
        </ProtectedRoute>
      } />
      <Route path="/destination/:id" element={
        <ProtectedRoute>
          <DestinationDetails />
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
      } />
      <Route path="/translator" element={
        <ProtectedRoute>
          <Translator />
        </ProtectedRoute>
      } />
      <Route path="/currency" element={
        <ProtectedRoute>
          <CurrencyConverter />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/bookings/:destinationId" element={
        <ProtectedRoute>
          <Bookings />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;