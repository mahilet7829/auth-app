import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { useAuth } from "./context/AuthContext";

import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import TouristPage from "./components/TouristPage";        // ← Now public home
import DestinationDetails from "./components/DestinationDetails";
import Wishlist from "./components/Wishlist";
import Translator from "./components/Translator";
import CurrencyConverter from "./components/CurrencyConverter";
import Dashboard from "./components/Dashboard";
import Bookings from "./components/Bookings";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading Ethiopia...</div>;

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<TouristPage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/translator" element={user ? <Translator /> : <Navigate to="/login" />} />
        <Route path="/currency" element={user ? <CurrencyConverter /> : <Navigate to="/login" />} />
        <Route path="/destination/:id" element={<DestinationDetails />} />
        <Route path="/bookings/:destinationId" element={user ? <Bookings /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;