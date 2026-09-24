import React from 'react';

function About({ theme }) {
  return (
    <section className="py-32 px-6 max-w-5xl mx-auto">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 opacity-50">About Me</h2>
      
      <div className={`space-y-8 ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>
        <p className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
          Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black dark:from-gray-400 dark:to-white">Priyanshi</span>, a Computer Engineering student who enjoys turning ideas into practical solutions.
        </p>
        
        <p className="text-xl md:text-3xl font-medium leading-snug max-w-4xl opacity-80">
          I'm particularly interested in <strong className="font-bold">Backend Development and Cloud Computing</strong>, and I'm exploring <strong className="font-bold">AI/ML</strong> to understand how intelligent systems can make applications smarter and more efficient.
        </p>

        <p className="text-lg md:text-2xl font-light leading-relaxed max-w-3xl opacity-70">
          I love learning by building, experimenting with new technologies, and solving problems that challenge me to think differently. I'm always curious about how things work behind the scenes and enjoy turning that curiosity into something meaningful.
        </p>

        <div className="pt-12">
          <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.1em] border-l-4 border-black dark:border-white pl-6">
            Build. Learn. Experiment. Grow.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
