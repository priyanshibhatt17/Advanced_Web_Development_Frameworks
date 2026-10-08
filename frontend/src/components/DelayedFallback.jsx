import { useState, useEffect } from 'react';

export default function DelayedFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Wait 300ms before showing the loading spinner to prevent 
    // flickering on fast network connections
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return show ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h2>Loading chunk... (Simulating Slow 3G)</h2>
    </div>
  ) : null;
}
