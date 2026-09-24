import React, { useState, useEffect, useCallback } from 'react';
import ScrollReveal from '../../practical1/components/ScrollReveal';

// Reusable Spinner Component
const Spinner = ({ theme }) => (
  <div className="py-12 flex flex-col items-center justify-center space-y-4">
    <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-white' : 'border-[#050505]'}`}></div>
    <span className={`text-sm font-bold uppercase tracking-[0.2em] opacity-50 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
      Loading Repositories
    </span>
  </div>
);

// Reusable Error Component
const ErrorMessage = ({ message, onRetry, theme }) => (
  <div className="py-12 flex flex-col items-start space-y-6">
    <div className="text-lg font-mono text-red-500 bg-red-500/10 p-4 border border-red-500/20 rounded">
      [System Error: {message}]
    </div>
    <button 
      onClick={onRetry}
      className={`text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 border transition-all ${theme === 'dark' ? 'border-white text-white hover:bg-white hover:text-[#050505]' : 'border-[#050505] text-[#050505] hover:bg-[#050505] hover:text-white'}`}
    >
      Retry Connection
    </button>
  </div>
);

function Projects({ theme }) {
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Intentionally using the exact username provided earlier
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
          description: repo.description || 'A backend/cloud project currently in development.',
          link: repo.html_url,
          stars: repo.stargazers_count // Extracted star count for Practical 3
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
    <div className="max-w-7xl mx-auto py-32 px-6">
      
      {!loading && !error && (
        <div className="mb-12">
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full max-w-md p-4 text-xl font-medium tracking-tight border focus:outline-none transition-colors ${theme === 'dark' ? 'bg-[#050505] border-white/20 text-white placeholder-gray-600 focus:border-white focus:bg-white/5' : 'bg-white border-black/20 text-[#050505] placeholder-gray-400 focus:border-black focus:bg-black/5'}`}
          />
        </div>
      )}

      {loading && <Spinner theme={theme} />}

      {error && <ErrorMessage message={error} onRetry={fetchProjects} theme={theme} />}

      {!loading && !error && filteredProjects.length === 0 && (
        <div className="py-12 text-lg font-mono opacity-50">
          No matching repositories found.
        </div>
      )}

      {!loading && !error && filteredProjects.length > 0 && (
        <div className="flex flex-col border-t border-white/10">
          {filteredProjects.map((proj, index) => (
            <ScrollReveal key={proj.id} delay={index * 100}>
              <a 
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between py-8 border-b transition-colors ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 transition-transform duration-500 group-hover:translate-x-6">
                  <span className={`text-xl md:text-3xl font-medium tracking-tight capitalize ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                    {proj.title}
                  </span>
                  <span className={`text-sm font-mono opacity-50 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                    ★ {proj.stars}
                  </span>
                </div>
                <span className={`text-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-6 group-hover:translate-x-0 ${theme === 'dark' ? 'text-white' : 'text-[#050505]'}`}>
                  ↗
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
