import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      updateActiveNav(id);
    }
  };

  const updateActiveNav = (sectionId: string) => {
    const navButtons = document.querySelectorAll(".nav-center button");
    navButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(
      `.nav-center button[data-target='${sectionId}']`
    );
    activeBtn?.classList.add("active");
  };

  useEffect(() => {
    const sections = document.querySelectorAll(".fullscreen-section");
    const navButtons = document.querySelectorAll(".nav-center button");

    const handleScroll = () => {
      const container = document.querySelector('.landing-container') as HTMLElement;
      if (!container) return;
      
      const scrollPosition = container.scrollTop + (window.innerHeight / 2);
      
      sections.forEach((section) => {
        const htmlSection = section as HTMLElement;
        const sectionTop = htmlSection.offsetTop;
        const sectionBottom = sectionTop + htmlSection.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          sections.forEach(sec => sec.classList.remove("active-section"));
          navButtons.forEach(btn => btn.classList.remove("active"));
          
          section.classList.add("active-section");
          const activeBtn = document.querySelector(
            `.nav-center button[data-target='${section.id}']`
          );
          activeBtn?.classList.add("active");
        }
      });
    };

    const container = document.querySelector('.landing-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Modal handlers
  const openLoginModal = () => {
    setModalMode('login');
    setIsModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalMode('register');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="landing-container">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="nav-content">
            <div className="nav-brand">
              Agri Farm
            </div>
            <div className="nav-center">
              <button data-target="hero" onClick={() => scrollTo("hero")}>Home</button>
              <button data-target="features" onClick={() => scrollTo("features")}>Features</button>
              <button data-target="impact" onClick={() => scrollTo("impact")}>Impact</button>
            </div>
            <div className="nav-actions">
              <button className="btn-login" onClick={openLoginModal}>Login</button>
              <button className="btn-primary" onClick={openRegisterModal}>Get Started</button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="hero" className="fullscreen-section hero-section">
          <div className="section-content">
            <div className="container">
              <div className="hero-content">
                <div className="hero-badge">
                  <span className="badge-icon">🔬</span>
                  Antimicrobial Stewardship Platform
                </div>
                <h1 className="hero-title">
                  Building a Safer Food System Through
                  <span className="title-accent"> Transparent Agri Farm Monitoring</span>
                </h1>
                <p className="hero-subtitle">
                  A smarter way to track antibiotic use in livestock farming — ensuring compliance, 
                  promoting responsible practices, and protecting public health through digital innovation.
                </p>
                <div className="hero-actions">
                  <button className="btn-primary-glow" onClick={openRegisterModal}>
                    Start Monitoring Free
                  </button>
                  <button className="btn-secondary-glow" onClick={() => scrollTo("features")}>
                    See How It Works
                  </button>
                </div>
                <div className="hero-features">
                  <div className="feature-pill">
                    <span className="check-icon">✓</span>
                    Real-time Tracking
                  </div>
                  <div className="feature-pill">
                    <span className="check-icon">✓</span>
                    Vet-Verified Data
                  </div>
                  <div className="feature-pill">
                    <span className="check-icon">✓</span>
                    Compliance Ready
                  </div>
                </div>
              </div>
            </div>
            <div className="scroll-indicator" onClick={() => scrollTo("features")}>
              <div className="scroll-arrow">↓</div>
              <span>Discover Our Platform</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="fullscreen-section features-section">
          <div className="section-content">
            <div className="container">
              <div className="section-header">
                <div className="section-number">02</div>
                <h2>Advanced Monitoring</h2>
                <p>Comprehensive tools for effective antimicrobial management and compliance</p>
              </div>
              <div className="features-content">
                <div className="features-grid">
                  <div className="feature-column">
                    <div className="feature-item">
                      <h3>Adaptation & Innovation</h3>
                      <p>Advanced systems adapting to evolving agricultural needs with innovative monitoring solutions</p>
                    </div>
                    <div className="feature-item">
                      <h3>Productivity & Efficiency</h3>
                      <p>Streamlined processes that enhance farm productivity while maintaining compliance standards</p>
                    </div>
                    <div className="feature-item">
                      <h3>Continuous Improvement</h3>
                      <p>Ongoing optimization of monitoring systems for better outcomes and sustainable practices</p>
                    </div>
                  </div>
                  <div className="feature-column">
                    <div className="feature-item">
                      <h3>Data Acquisition</h3>
                      <p>Comprehensive data collection and analysis for informed decision-making in antimicrobial usage</p>
                    </div>
                    <div className="feature-item">
                      <h3>Performance Metrics</h3>
                      <p>Detailed analytics and reporting to measure and improve farm management efficiency</p>
                    </div>
                    <div className="feature-item">
                      <h3>Sustainable Growth</h3>
                      <p>Promoting sustainable agricultural practices through responsible antimicrobial management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="scroll-indicator" onClick={() => scrollTo("impact")}>
              <div className="scroll-arrow">↓</div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="fullscreen-section impact-section">
          <div className="section-content">
            <div className="container">
              <div className="section-header">
                <div className="section-number">03</div>
                <h2>Industry Impact</h2>
                <p>Transforming agricultural practices through technology and innovation</p>
              </div>
              <div className="impact-content">
                <div className="impact-grid">
                  <div className="impact-item">
                    <div className="impact-icon">🏥</div>
                    <h3>Healthcare Integration</h3>
                    <p>Seamless integration with veterinary healthcare systems for comprehensive animal welfare monitoring</p>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">📱</div>
                    <h3>Digital Transformation</h3>
                    <p>Modern digital solutions replacing traditional methods for better accuracy and efficiency</p>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🔬</div>
                    <h3>Research & Development</h3>
                    <p>Continuous research to improve monitoring technologies and agricultural best practices</p>
                  </div>
                  <div className="impact-item">
                    <div className="impact-icon">🌍</div>
                    <h3>Global Standards</h3>
                    <p>Adherence to international standards for antimicrobial usage and food safety compliance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="scroll-indicator" onClick={() => scrollTo("hero")}>
              <div className="scroll-arrow">↑</div>
              <span>Scroll up to return</span>
            </div>
          </div>
        </section>
      </div>

      {/* Auth Modal Component */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        initialMode={modalMode}
      />
    </>
  );
}
