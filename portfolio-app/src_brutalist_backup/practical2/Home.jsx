import React from 'react';
import Header from '../practical1/Header';
import About from '../practical1/About';
import Skills from '../practical1/Skills';
import Footer from '../practical1/Footer';

function Home({ theme }) {
  const mySkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Vite'];

  return (
    <div className="flex flex-col">
      <Header name="Priyanshi Bhatt" theme={theme} />
      <div className="flex-grow pb-24">
        <About theme={theme} />
        <Skills skillList={mySkills} theme={theme} />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
