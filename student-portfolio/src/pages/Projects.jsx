import React, { useState, useEffect } from 'react';

// Spinner Component for loading state
function Spinner() {
  return <div className="spinner">Loading repositories...</div>;
}

// ErrorMessage Component for error state
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <p>Error: {message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRepos = () => {
    setLoading(true);
    setError(null);
    
    // Using the requested username 'priyanshibhatt17'
    fetch('https://api.github.com/users/priyanshibhatt17/repos')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch repositories. Status: ' + res.status);
        }
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page projects-page">
      <h2>My Projects</h2>
      
      {loading && <Spinner />}
      
      {error && <ErrorMessage message={error} onRetry={fetchRepos} />}
      
      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <ul className="repo-list">
            {filteredRepos.map((repo) => (
              <li key={repo.id} className="repo-item">
                <h3>{repo.name}</h3>
                <p>Stars: {repo.stargazers_count}</p>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </li>
            ))}
            {filteredRepos.length === 0 && <p>No repositories match your search.</p>}
          </ul>
        </>
      )}
    </div>
  );
}

export default Projects;
