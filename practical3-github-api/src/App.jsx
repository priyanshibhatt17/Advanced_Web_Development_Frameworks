import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const Spinner = () => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <p>Loading Repositories...</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-container">
    <p className="error-text">System Error: {message}</p>
    <button onClick={onRetry} className="retry-btn">Retry Connection</button>
  </div>
);

function App() {
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.github.com/users/priyanshibhatt17/repos?sort=updated&per_page=100');
      if (!response.ok) {
        throw new Error('Failed to fetch from GitHub API');
      }
      const data = await response.json();
      
      const formattedProjects = data
        .filter(repo => !repo.fork)
        .map(repo => ({
          id: repo.id,
          title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
          description: repo.description || 'No description provided.',
          link: repo.html_url,
          stars: repo.stargazers_count
        }));
        
      setProjectsData(formattedProjects);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load projects at this time.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projectsData.filter(proj => 
    proj.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <h1>Practical 3: GitHub API Integration</h1>
      </header>

      {!loading && !error && (
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {loading && <Spinner />}

      {error && <ErrorMessage message={error} onRetry={fetchProjects} />}

      {!loading && !error && filteredProjects.length === 0 && (
        <p className="empty-state">No matching repositories found.</p>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div className="project-list">
          {filteredProjects.map((proj) => (
            <a key={proj.id} href={proj.link} target="_blank" rel="noopener noreferrer" className="project-card">
              <div className="project-header">
                <h2>{proj.title}</h2>
                <span className="stars">★ {proj.stars}</span>
              </div>
              <p className="project-desc">{proj.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
