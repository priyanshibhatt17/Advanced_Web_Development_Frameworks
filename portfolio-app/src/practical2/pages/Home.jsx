import React from 'react';
import Header from '../../practical1/components/Header';
import About from '../../practical1/components/About';
import Skills from '../../practical1/components/Skills';
import Footer from '../../practical1/components/Footer';
import ScrollReveal from '../../practical1/components/ScrollReveal';
import SocialLinks from '../components/SocialLinks';

function Home({ theme }) {
  const mySkills = ['Java', 'Spring Boot', 'Python', 'FastAPI', 'SQL'];

  return (
    <div className="flex flex-col">
      <Header name="Priyanshi Bhatt" theme={theme} />
      <div className="flex-grow pb-24">
        <ScrollReveal delay={0}>
          <About theme={theme} />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Skills skillList={mySkills} theme={theme} />
        </ScrollReveal>
        <SocialLinks theme={theme} />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
