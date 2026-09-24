import React from 'react';

function Header({ name, theme }) {
  return (
    <header className="min-h-[80vh] flex flex-col justify-center px-6 max-w-7xl mx-auto transition-colors duration-500 w-full">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 animate-fade-in-up">
        
        {/* Left Side: Massive Name */}
        <div>
          <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] uppercase ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
            Priyanshi<br/>Bhatt
          </h1>
        </div>

        {/* Right Side: Creative Tags */}
        <div className={`font-mono text-lg md:text-xl font-bold tracking-widest uppercase opacity-40 text-left md:text-right pb-4 max-w-sm ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
          <p className="mb-2 hover:opacity-100 transition-opacity cursor-default">&lt;Hello world&gt;</p>
          <p className="hover:opacity-100 transition-opacity cursor-default">&lt;I build backend systems & explore the cloud /&gt;</p>
        </div>
        
      </div>
    </header>
  );
}

export default Header;
