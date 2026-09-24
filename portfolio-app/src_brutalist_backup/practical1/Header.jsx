import React from 'react';

function Header({ name, theme }) {
  return (
    <header className="pt-40 pb-20 px-6 max-w-7xl mx-auto transition-colors duration-500">
      <h1 className={`text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-6 uppercase ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>
        Priyanshi<br/>Bhatt
      </h1>
      <div className={`h-1 w-24 mb-6 ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
      <h2 className={`text-xl md:text-3xl font-medium tracking-tight opacity-70 ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>
        Software Engineering Student
      </h2>
    </header>
  );
}

export default Header;
