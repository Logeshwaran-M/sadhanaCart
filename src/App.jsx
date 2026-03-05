import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Category from './pages/Category';
import SubCategory from './pages/SubCategory';
import SubUnderCategory from './pages/SubUnderCategory';
import Brands from './pages/Brands';
import VariantType from './pages/VariantType';
import Variants from './pages/Variants';
import Orders from './pages/Orders';
import Sellers from './pages/Sellers';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Posters from './pages/Posters';
import Profile from './pages/Profile';
import JsonUploadPage from './pages/JsonUploadPage';
import PythonAutomation from './pages/PythonAutomation';
import Login from './pages/Login';
import Register from './pages/Register';
import CommissionManagement from './pages/CommissionManagement';
import ForgotPassword from './components/ForgotPass';
import FeaturedProducts from './pages/FeaturedProducts';
import RecommendedProducts from './pages/Recomented';

const App = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
  const token = localStorage.getItem("authToken");
  return !!token; // true if token exists
});
  const [isLoading, setIsLoading] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 🔐 Firebase Auth + Firestore Role Check

useEffect(() => {
  const token = localStorage.getItem("authToken");

  if (token) {
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }

  setIsLoading(false);
}, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/" replace />
              : <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex bg-gray-900 min-h-screen">
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                  <Header 
  onToggleSidebar={toggleSidebar} 
  setIsAuthenticated={setIsAuthenticated} 
/>

                  <main className="flex-1 overflow-auto bg-gray-900">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/category" element={<Category />} />
                      <Route path="/sub-category" element={<SubCategory />} />
                      <Route path="/sub-under-category" element={<SubUnderCategory />} />
                      <Route path="/brands" element={<Brands />} />
                      <Route path="/variant-type" element={<VariantType />} />
                      <Route path="/variants" element={<Variants />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/sellers" element={<Sellers />} />
                      <Route path="/commission" element={<CommissionManagement />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/coupons" element={<Coupons />} />
                      <Route path="/posters" element={<Posters />} />
                      <Route path="/json-upload" element={<JsonUploadPage />} />
                      <Route path="/python-automation" element={<PythonAutomation />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/featured" element={<FeaturedProducts />} />
                      <Route path="/recommended" element={<RecommendedProducts />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </Router>
  );
};

export default App;