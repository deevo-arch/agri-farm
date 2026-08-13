import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import ParticleText from "../components/ParticleText";
import LiquidEther from "../components/LiquidEther";
import BorderGlow from "../components/BorderGlow";
import SpotlightCard from "../components/SpotlightCard";
import MagicBento, { BentoCardData } from "../components/MagicBento";
import GooeyNav, { GooeyNavItem } from "../components/GooeyNav";
import FoldText from "../components/FoldText";
import HowItWorksModal from "../components/HowItWorksModal";
import TextLoop from "../components/TextLoop";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHowModalOpen, setIsHowModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  const navItems: GooeyNavItem[] = [
    { label: "Home", href: "#hero", onClick: (e) => { e.preventDefault(); scrollTo("hero"); } },
    { label: "Features", href: "#features", onClick: (e) => { e.preventDefault(); scrollTo("features"); } },
    { label: "Impact", href: "#impact", onClick: (e) => { e.preventDefault(); scrollTo("impact"); } },
    { label: "Login", href: "#login", onClick: (e) => { e.preventDefault(); openLoginModal(); } },
    { label: "Get Started", href: "#register", onClick: (e) => { e.preventDefault(); openRegisterModal(); } }
  ];

  const monitoringBentoCards: BentoCardData[] = [
    {
      color: '#13111c',
      title: 'Adaptation & Innovation',
      description: 'Advanced systems adapting to evolving agricultural needs with innovative monitoring solutions',
      label: 'Innovation',
      icon: '🚀'
    },
    {
      color: '#13111c',
      title: 'Productivity & Efficiency',
      description: 'Streamlined processes that enhance farm productivity while maintaining compliance standards',
      label: 'Efficiency',
      icon: '⚡'
    },
    {
      color: '#13111c',
      title: 'Continuous Improvement',
      description: 'Ongoing optimization of monitoring systems for better outcomes and sustainable practices',
      label: 'Optimization',
      icon: '📈'
    },
    {
      color: '#13111c',
      title: 'Data Acquisition',
      description: 'Comprehensive data collection and analysis for informed decision-making in antimicrobial usage',
      label: 'Insights',
      icon: '📊'
    },
    {
      color: '#13111c',
      title: 'Performance Metrics',
      description: 'Detailed analytics and reporting to measure and improve farm management efficiency',
      label: 'Analytics',
      icon: '🎯'
    },
    {
      color: '#13111c',
      title: 'Sustainable Growth',
      description: 'Promoting sustainable agricultural practices through responsible antimicrobial management',
      label: 'Sustainability',
      icon: '🌱'
    }
  ];

  useEffect(() => {
    const sections = document.querySelectorAll(".fullscreen-section");

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
          section.classList.add("active-section");
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

  return (
    <>
      <div className="landing-container">
        {/* REACT BITS LIQUID ETHER FLUID SIMULATION BACKGROUND */}
        <div className="liquid-ether-background-layer">
          <LiquidEther
            colors={['#5227FF', '#8b5cf6', '#38bdf8']}
            mouseForce={22}
            cursorSize={120}
            isViscous={false}
            viscous={30}
            resolution={0.5}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
          />
        </div>

        {/* Navigation - Integrated with React Bits GooeyNav */}
        <nav className="landing-nav neu-card">
          <div className="nav-content">
            <div className="nav-brand-container">
              <ParticleText
                text="Agri Farm"
                particleSize={1.6}
                density={3}
                color="#ffffff"
                highlightColor="#8b5cf6"
                scatter={90}
                gatherDuration={1200}
                stagger={200}
                pointerRepel={30}
                repelRadius={70}
                idleDrift={0.5}
                trigger="hover"
                fontSize="1.4rem"
                fontWeight={800}
                fontFamily="inherit"
                glow
              />
            </div>

            {/* REACT BITS GOOEYNAV COMPONENT */}
            <div className="nav-gooey-wrapper">
              <GooeyNav
                items={navItems}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="hero" className="fullscreen-section hero-section">
          <div className="section-content">
            <div className="container">
              <div className="hero-content">
                {/* ParticleText Hero Banner */}
                <div className="hero-particle-main">
                  <ParticleText
                    text="Agri Farm"
                    particleSize={2.2}
                    density={4}
                    color="#ffffff"
                    highlightColor="#8b5cf6"
                    scatter={180}
                    gatherDuration={1600}
                    stagger={420}
                    pointerRepel={40}
                    repelRadius={120}
                    idleDrift={0.7}
                    trigger="hover"
                    fontSize="clamp(3rem, 8vw, 5.8rem)"
                    fontWeight={800}
                    fontFamily="inherit"
                    glow
                  />
                </div>

                <h1 className="hero-title">
                  Building a Safer Food System Through
                  <span className="title-accent"> Transparent Antimicrobial Monitoring</span>
                </h1>

                {/* RELOCATED BADGE TEXT */}
                <div className="hero-badge neu-inset">
                  <span className="badge-icon">🔬</span>
                  Antimicrobial Stewardship Platform
                </div>

                <p className="hero-subtitle">
                  A smarter way to track antibiotic use in livestock farming — ensuring compliance,
                  promoting responsible practices, and protecting public health through digital innovation.
                </p>
                <div className="hero-actions">
                  <button className="btn-primary-neu" onClick={openRegisterModal}>
                    Start Monitoring Free
                  </button>
                  <button className="btn-secondary-glow neu-btn" onClick={() => setIsHowModalOpen(true)}>
                    See How It Works
                  </button>
                </div>

                {/* ANIMATED SCROLL DOWN INDICATOR RIGHT BELOW ACTION BUTTONS */}
                <div className="hero-scroll-down-indicator" onClick={() => scrollTo("features")}>
                  <div className="mouse-scroll-capsule">
                    <div className="mouse-scroll-dot" />
                  </div>
                  <span className="scroll-down-label">Scroll Down To Explore</span>
                  <div className="scroll-down-chevron">↓</div>
                </div>

                {/* FULL-SCREEN WIDTH REACT BITS TEXTLOOP COMPONENT */}
                <div className="hero-text-loop-ribbon">
                  <TextLoop
                    text="Real Time ✦ Vet Verified ✦ Compliance Ready"
                    shape="wave"
                    speed={85}
                    direction="forward"
                    separator="✦"
                    curviness={70}
                    fontSize={38}
                    fontWeight={800}
                    letterSpacing={2}
                    uppercase
                    color="#ffffff"
                    ribbon
                    ribbonColor="#5227FF"
                    ribbonWidth={75}
                    pauseOnHover={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Integrated with React Bits MagicBento */}
        <section id="features" className="fullscreen-section features-section">
          <div className="section-content">
            <div className="container">
              <div className="section-header">
                <div className="section-number">02</div>
                <h2>Advanced Monitoring</h2>
                <p>Comprehensive tools for effective antimicrobial management and compliance</p>
              </div>
              <div className="features-content">
                {/* REACT BITS MAGIC BENTO COMPONENT */}
                <MagicBento
                  cards={monitoringBentoCards}
                  textAutoHide={false}
                  enableStars={true}
                  enableSpotlight={true}
                  enableBorderGlow={true}
                  enableTilt={true}
                  enableMagnetism={true}
                  clickEffect={true}
                  spotlightRadius={300}
                  particleCount={12}
                  glowColor="139, 92, 246"
                />
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
                  <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={20}>
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.28)">
                      <div className="impact-item-content">
                        <div className="impact-icon">🏥</div>
                        <h3>Healthcare Integration</h3>
                        <p>Seamless integration with veterinary healthcare systems for comprehensive animal welfare monitoring</p>
                      </div>
                    </SpotlightCard>
                  </BorderGlow>

                  <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={20}>
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.28)">
                      <div className="impact-item-content">
                        <div className="impact-icon">📱</div>
                        <h3>Digital Transformation</h3>
                        <p>Modern digital solutions replacing traditional methods for better accuracy and efficiency</p>
                      </div>
                    </SpotlightCard>
                  </BorderGlow>

                  <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={20}>
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.28)">
                      <div className="impact-item-content">
                        <div className="impact-icon">🔬</div>
                        <h3>Research & Development</h3>
                        <p>Continuous research to improve monitoring technologies and agricultural best practices</p>
                      </div>
                    </SpotlightCard>
                  </BorderGlow>

                  <BorderGlow colors={['#8b5cf6', '#c084fc', '#38bdf8']} backgroundColor="#13111c" borderRadius={20}>
                    <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.28)">
                      <div className="impact-item-content">
                        <div className="impact-icon">🌍</div>
                        <h3>Global Standards</h3>
                        <p>Adherence to international standards for antimicrobial usage and food safety compliance</p>
                      </div>
                    </SpotlightCard>
                  </BorderGlow>
                </div>
              </div>
            </div>
            <div className="hero-scroll-up-indicator" onClick={() => scrollTo("hero")}>
              <div className="scroll-up-chevron">↑</div>
              <div className="mouse-scroll-capsule">
                <div className="mouse-scroll-up-dot" />
              </div>
              <span className="scroll-up-label">Scroll Up To Return</span>
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

      {/* How It Works System Explanation Modal */}
      <HowItWorksModal
        isOpen={isHowModalOpen}
        onClose={() => setIsHowModalOpen(false)}
      />
    </>
  );
}
