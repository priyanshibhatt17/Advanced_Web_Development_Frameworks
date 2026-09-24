import React, { useEffect, useRef, useState } from 'react';

function ScrollReveal({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    
    return () => {
      if (domRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(domRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out will-change-transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
