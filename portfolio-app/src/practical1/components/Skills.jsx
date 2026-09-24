import React, { useEffect, useRef, useState } from 'react';

const SkillItem = ({ skill, theme }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHighlighted(entry.isIntersecting);
      },
      {
        // Highlight when the item is in the middle 50% of the viewport
        rootMargin: "-25% 0px -25% 0px",
        threshold: 0
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight py-4 cursor-default text-right w-full flex justify-end"
    >
      {skill.split('').map((char, i) => (
        <span 
          key={i}
          className={`transition-colors duration-500 ${
            isHighlighted 
              ? (theme === 'dark' ? 'text-white' : 'text-[#050505]') 
              : (theme === 'dark' ? 'text-white/20' : 'text-black/20')
          }`}
          style={{ transitionDelay: `${i * 50}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

function Skills({ skillList, theme }) {
  if (!skillList || skillList.length === 0) return null;

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10 mt-12">
      <div className="flex flex-col md:flex-row gap-16 relative">
        <div className="md:w-1/4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 sticky top-32">SKILLS</h2>
        </div>
        <div className="md:w-3/4 flex flex-col gap-2">
          {skillList.map((skill, index) => (
            <SkillItem key={index} skill={skill} theme={theme} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
