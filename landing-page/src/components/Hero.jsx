import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="hero-container">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          100% Offline Processing
        </div>
        <h1>
          Document Conversions,<br />
          <span className="highlight">Completely Local</span>
        </h1>
        <p className="hero-description">
          Convert PDFs to Excel, Word, and more. Everything runs on your machine.
          No uploads. No cloud. No privacy concerns.
        </p>
        <div className="hero-cta">
          <a href="#download" className="btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Free
          </a>
          <a href="#features" className="btn-ghost">
            See Features
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
