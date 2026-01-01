import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Download from './components/Download'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <Download />
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">CE</span>
          <span>2024 CommonExtractors</span>
        </div>
      </footer>
    </div>
  )
}

export default App
