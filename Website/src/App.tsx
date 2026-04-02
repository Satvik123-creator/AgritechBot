import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Contact from './pages/Contact';
import VendorProfile from './pages/VendorProfile';
import DownloadApp from './pages/DownloadApp';
import AboutUs from './pages/AboutUs';
import Sustainability from './pages/Sustainability';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import Checkout from './pages/Checkout';
import AdminOrders from './pages/AdminOrders';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface text-on-surface font-body selection:bg-tertiary-fixed selection:text-on-tertiary-fixed flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/download" element={<DownloadApp />} />
            <Route path="/checkout/:paymentOrderId" element={<Checkout />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
