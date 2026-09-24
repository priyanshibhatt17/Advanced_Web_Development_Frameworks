import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Go back to Home</Link>
    </div>
  );
}

export default NotFound;
