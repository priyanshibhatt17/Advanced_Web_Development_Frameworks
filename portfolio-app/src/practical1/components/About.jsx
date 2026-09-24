import React from 'react';

function About({ theme }) {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10 mt-12 relative">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        
        {/* Left Side: Clean Typography */}
        <div className="lg:w-1/3 sticky top-32">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-8 opacity-50">About Me</h2>
          <div className="relative">
            <p className={`text-xl md:text-3xl font-medium leading-[1.3] tracking-tight relative z-10 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
              Turning ideas into practical solutions.
            </p>
          </div>
        </div>

        {/* Right Side: Softer Typography */}
        <div className="lg:w-2/3 flex flex-col gap-12 pt-8">
          
          <div className="max-w-3xl">
            <p className={`text-2xl md:text-4xl font-normal leading-relaxed tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
              Hi, I'm <span className="font-semibold">Priyanshi</span>, a Computer Engineering student who loves learning by building, experimenting with new technologies, and solving problems that challenge me to think differently.
            </p>
          </div>

          <div className="max-w-3xl">
            <p className={`text-xl md:text-2xl font-normal leading-relaxed opacity-80 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
              Particularly interested in <span className="font-medium">Backend Development & Cloud Computing</span>, while exploring <span className="font-medium">AI/ML</span> for intelligent systems.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;
