import { useState } from 'react';

function Contact() {
  const [message, setMessage] = useState('');

  return (
    <main className="page page-contact">
      <div className="contact-card">
        <h1>Contact Me</h1>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
        />
        <p>Your message: {message}</p>
        <p>Character count: {message.length}</p>
      </div>
    </main>
  );
}

export default Contact