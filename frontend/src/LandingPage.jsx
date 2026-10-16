import React from 'react';
import './LandingPage.css';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="landing-body">
      <div className="landing-container">
        
        {/* HEADER */}
        <header className="landing-header">
          <div className="logo">
            <div className="logo-icon"></div>
            Task Management
          </div>
          <div className="nav-actions">
            <button className="get-started-btn" onClick={onLoginClick}>Get Started</button>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="hero">
          <h1>Plan less. Accomplish more.</h1>
          <p>Organize your tasks, prioritize what matters, and stay focused from your first task to your final checkmark.</p>
        </section>

        {/* FEATURE SECTION */}
        <section id="features" className="features">
          <div className="feature-grid">
            
            <div className="feature-card">
              <div className="feature-visual plan">
                <div className="mock-ui-chip" style={{ top: '20px', left: '20px' }}>To do</div>
                <div className="mock-ui-chip" style={{ top: '60px', left: '40px', background: '#f8fafc' }}>In Work</div>
                <div className="mock-ui-chip" style={{ top: '100px', right: '20px' }}>Review</div>
              </div>
              <h3>PLAN</h3>
              <p>Turn your ideas and tasks into a clear plan.</p>
            </div>

            <div className="feature-card">
              <div className="feature-visual prioritize">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fff" />
                </svg>
              </div>
              <h3>PRIORITIZE</h3>
              <p>Know exactly what deserves your attention next.</p>
            </div>

            <div className="feature-card">
              <div className="feature-visual achieve">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>ACHIEVE</h3>
              <p>Track your progress and turn plans into results.</p>
            </div>

          </div>
        </section>

        {/* FINAL CTA */}
        <section className="cta-section">
          <button className="get-started-btn main-cta" onClick={onLoginClick}>Start organizing</button>
        </section>

      </div>
    </div>
  );
}
