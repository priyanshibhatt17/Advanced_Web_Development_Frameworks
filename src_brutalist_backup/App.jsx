import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './practical2/NavBar';
import Home from './practical2/Home';
import Projects from './practical2/Projects';
import Contact from './practical2/Contact';
import NotFound from './practical2/NotFound';
import './index.css';

function App() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}`}>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow pt-32">
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