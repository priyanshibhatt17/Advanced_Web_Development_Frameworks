import React from 'react';
import ScrollReveal from '../../practical1/components/ScrollReveal';

function SocialLinks({ theme }) {
  const socials = [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/priyanshi-bhatt-51b3b1290/' },
    { name: 'GitHub', url: 'https://github.com/priyanshibhatt17' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-32 px-6 mt-12">
      <div className="flex flex-col md:flex-row gap-16 items-start">
        
        {/* Left Side: Softer "Get in Touch" */}
        <div className="md:w-1/2">
          <ScrollReveal delay={0}>
            <h2 className={`text-5xl md:text-6xl font-semibold uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
              Get in<br/>Touch.
            </h2>
          </ScrollReveal>
        </div>
        
        {/* Right Side: Links */}
        <div className="md:w-1/2 flex flex-col border-t w-full mt-4 md:mt-0 border-white/10">
          {socials.map((social, index) => (
            <ScrollReveal key={social.name} delay={index * 150}>
              <a 
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between py-8 border-b transition-colors ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`}
              >
                <span className={`text-2xl md:text-4xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-6 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                  {social.name}
                </span>
                <span className={`text-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-6 group-hover:translate-x-0 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                  ↗
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </div>
  );
}

export default SocialLinks;
