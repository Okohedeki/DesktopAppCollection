import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 15l2 2 4-4"/>
            </svg>
          </div>
          <span>CommonExtractors</span>
        </a>
        <a href="#download" className="navbar-cta">
          Download Free
        </a>
      </div>
    </nav>
  )
}

export default Navbar
