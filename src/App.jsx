import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './practical2/components/NavBar';
import Home from './practical2/pages/Home';
import Projects from './practical2/pages/Projects';
import Contact from './practical2/pages/Contact';
import NotFound from './practical2/NotFound';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-700 relative ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f5f5f5] text-[#050505]'}`}>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow pt-32 z-10 relative">
        <Routes>
          <Route path="/" element={<Home theme={theme} />} />
          <Route path="/projects" element={<Projects theme={theme} />} />
          <Route path="/contact" element={<Contact theme={theme} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;