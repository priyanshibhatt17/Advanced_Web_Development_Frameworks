import React, { useState } from 'react';

function Contact({ theme }) {
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-32 px-6 border-t-2 border-black dark:border-white">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-16 opacity-50">Get in Touch</h2>
      
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h3 className={`text-5xl md:text-7xl font-bold tracking-tight mb-8 ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>
            Let's<br/>talk.
          </h3>
        </div>
        
        <div>
          <div className="mb-12">
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows="4"
              placeholder="YOUR MESSAGE"
              className={`w-full p-6 text-2xl font-bold uppercase tracking-widest border-2 focus:outline-none transition-colors ${theme === 'dark' ? 'bg-[#111111] border-white text-white placeholder-gray-600 focus:bg-white focus:text-black' : 'bg-white border-black text-black placeholder-gray-300 focus:bg-black focus:text-white'}`}
            />
            <p className={`text-sm font-bold mt-4 uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              CHARS: {message.length}
            </p>
          </div>

          <div className="relative inline-block w-full">
            <button 
              onMouseEnter={() => setShowTooltip(true)} 
              onMouseLeave={() => setShowTooltip(false)}
              className={`w-full py-6 text-2xl font-bold uppercase tracking-widest border-2 transition-all ${theme === 'dark' ? 'border-white bg-white text-black hover:bg-[#111111] hover:text-white' : 'border-black bg-black text-white hover:bg-white hover:text-black'}`}
            >
              SEND
            </button>
            {showTooltip && (
              <div className={`absolute -top-16 left-0 w-full text-center py-2 text-sm font-bold uppercase tracking-widest border-2 ${theme === 'dark' ? 'bg-[#111111] border-white text-white' : 'bg-white border-black text-black'}`}>
                MOCK FORM
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
