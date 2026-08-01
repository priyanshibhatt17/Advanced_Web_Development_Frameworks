import React from 'react';

function Header({ name }) {
  return (
    <header className="header">
      <h1>Student Portfolio</h1>
      <h2>{name}</h2>
    </header>
  );
}

export default Header;
