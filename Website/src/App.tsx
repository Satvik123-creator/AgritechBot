import { motion } from 'framer-motion';
import { Mic, Leaf, ShoppingCart, MessageSquare, Zap, Globe, Shield } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <Leaf className="logo-icon" />
          <span>Anaaj AI</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#download">Download</a>
          <a className="btn-primary" href="#download">Download App</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="gradient-text"
          >
            Empowering Farmers with <br /> Human-Centric AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The world's first multi-language voice-first agritech assistant. 
            Speak your language, grow your success.
          </motion.p>
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="mic-container float">
              <Mic size={48} className="mic-icon" />
              <div className="pulse"></div>
            </div>
            <span className="cta-text">"How do I improve my wheat yield?"</span>
          </motion.div>
        </div>
        
        <div className="hero-visual">
          <div className="blob shadow"></div>
          <div className="blob-2 shadow"></div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="features">
        <div className="section-header">
          <h2 className="gradient-text">Why Anaaj AI?</h2>
          <p>Built for the modern farmer, powered by advanced neural networks.</p>
        </div>
        
        <div className="feature-grid">
          {[
            { icon: <Globe />, title: "Hyper-Local", text: "Support for Hindi, Punjabi, Gujarati and more." },
            { icon: <MessageSquare />, title: "Voice First", text: "No typing required. Just talk to your fields." },
            { icon: <Zap />, title: "Instant Insights", text: "Real-time crop disease detection and weather alerts." },
            { icon: <ShoppingCart />, title: "Marketplace", text: "Direct access to fertilizers, seeds, and tools." },
            { icon: <Shield />, title: "Secure", text: "Your data is protected with enterprise-grade security." },
            { icon: <Leaf />, title: "Organic Growth", text: "Personalized advice for sustainable farming." },
          ].map((f, i) => (
            <motion.div 
              key={i}
              className="premium-card feature-item"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="download" className="download-section">
        <div className="section-header">
          <h2 className="gradient-text">Get Anaaj AI App</h2>
          <p>Android build is available for direct client installation.</p>
        </div>
        <div className="premium-card download-card">
          <h3>Need the latest APK?</h3>
          <p>
            Contact the Anaaj AI team to receive the latest signed Android APK and onboarding support.
          </p>
          <a className="btn-primary" href="mailto:hello@anaaj.ai">Request APK</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Anaaj AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
