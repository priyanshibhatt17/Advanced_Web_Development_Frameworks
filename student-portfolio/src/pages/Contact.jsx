import React, { useState } from 'react';

function Contact() {
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="page contact-page">
      <h2>Contact Me</h2>
      
      <div className="form-group">
        <label>
          Message:
          <button 
            type="button" 
            className="tooltip-btn"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            ?
          </button>
        </label>
        
        {showTooltip && (
          <p className="tooltip">Enter your message below. The text updates in real-time.</p>
        )}
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows="5"
        />
      </div>

      <div className="live-preview">
        <h3>Live Preview:</h3>
        <p>{message || 'Your message will appear here...'}</p>
        <p className="char-count">Character count: {message.length}</p>
      </div>
    </div>
  );
}

export default Contact;
