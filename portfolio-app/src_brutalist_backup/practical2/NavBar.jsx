import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar({ theme, toggleTheme }) {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    const base = 'text-sm font-bold uppercase tracking-[0.2em] px-4 py-2 transition-colors duration-300';
    if (theme === 'dark') {
      return `${base} ${isActive ? 'bg-white text-black' : 'text-white hover:bg-white hover:text-black'}`;
    }
    return `${base} ${isActive ? 'bg-black text-white' : 'text-black hover:bg-black hover:text-white'}`;
  };

  return (
    <nav className={`fixed w-full top-0 z-50 px-6 py-6 flex items-center justify-between transition-colors duration-500 border-b-2 ${theme === 'dark' ? 'bg-[#111111] border-white' : 'bg-white border-black'}`}>
      <div className="flex-1">
        <span className={`text-xl font-bold tracking-tighter uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>PB.</span>
      </div>
      <div className="hidden md:flex items-center gap-4">
        <Link to="/" className={getLinkClass('/')}>Home</Link>
        <Link to="/projects" className={getLinkClass('/projects')}>Projects</Link>
        <Link to="/contact" className={getLinkClass('/contact')}>Contact</Link>
      </div>
      <div className="flex-1 flex justify-end">
        <button 
          onClick={toggleTheme}
          className={`text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 border-2 transition-all ${theme === 'dark' ? 'border-white text-white hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white'}`}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
