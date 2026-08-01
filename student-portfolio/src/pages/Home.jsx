import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';
import Footer from '../components/Footer';

function Home() {
  const mySkills = ['React', 'JavaScript', 'HTML', 'CSS', 'Vite'];
  
  return (
    <div className="page home-page">
      <Header name="Priyanshi Bhatt" />
      <main>
        <About />
        <Skills skillList={mySkills} />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
