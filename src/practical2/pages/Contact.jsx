import React, { useState } from 'react';
import ScrollReveal from '../../practical1/components/ScrollReveal';

function Contact({ theme }) {
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="max-w-7xl mx-auto pt-32 pb-16 px-6 mt-12">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <ScrollReveal delay={100}>
            <h3 className={`text-3xl md:text-5xl font-bold tracking-tight mb-8 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
              Let's<br/>talk.
            </h3>
          </ScrollReveal>
        </div>
        
        <div>
          <ScrollReveal delay={200}>
            <div className="mb-12">
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows="4"
                placeholder="YOUR MESSAGE"
                className={`w-full p-6 text-2xl font-bold uppercase tracking-widest border focus:outline-none transition-colors ${theme === 'dark' ? 'bg-[#050505] border-white/20 text-white placeholder-gray-600 focus:bg-white focus:text-[#050505]' : 'bg-white border-black/20 text-[#050505] placeholder-gray-300 focus:bg-[#050505] focus:text-white'}`}
              />
              <p className={`text-sm font-bold mt-4 uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                CHARS: {message.length}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="relative inline-block w-full">
              <button 
                onMouseEnter={() => setShowTooltip(true)} 
                onMouseLeave={() => setShowTooltip(false)}
                className={`w-full py-6 text-2xl font-bold uppercase tracking-widest border transition-all ${theme === 'dark' ? 'border-white/20 bg-white text-[#050505] hover:bg-transparent hover:text-white' : 'border-black/20 bg-[#050505] text-white hover:bg-white hover:text-[#050505]'}`}
              >
                SEND
              </button>
              {showTooltip && (
                <div className={`absolute -top-16 left-0 w-full text-center py-2 text-sm font-bold uppercase tracking-widest border ${theme === 'dark' ? 'bg-[#050505] border-white/20 text-white' : 'bg-white border-black/20 text-[#050505]'}`}>
                  MOCK FORM
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

export default Contact;
