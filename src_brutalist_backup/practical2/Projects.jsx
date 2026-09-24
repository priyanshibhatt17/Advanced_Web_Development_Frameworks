import React from 'react';

function Projects({ theme }) {
  const projects = [
    { id: 1, title: 'E-commerce App', description: 'A full-stack e-commerce solution.' },
    { id: 2, title: 'Weather Dashboard', description: 'Real-time weather data visualization.' },
    { id: 3, title: 'Task Manager', description: 'Kanban-style task management.' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-32 px-6 border-t-2 border-black dark:border-white mt-12">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-16 opacity-50">Selected Projects</h2>
      <div className="flex flex-col">
        {projects.map((proj, index) => (
          <div key={proj.id} className={`group flex flex-col md:flex-row md:items-end justify-between py-12 border-b-2 transition-colors ${theme === 'dark' ? 'border-white hover:bg-[#1a1a1a]' : 'border-black hover:bg-[#f5f5f5]'}`}>
            <div className="flex items-start gap-8">
              <span className="text-4xl md:text-5xl font-bold opacity-30 mt-1">0{index + 1}</span>
              <div>
                <h3 className={`text-4xl md:text-6xl font-bold tracking-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>{proj.title}</h3>
                <p className={`text-xl font-medium opacity-70 max-w-xl ${theme === 'dark' ? 'text-white' : 'text-[#111111]'}`}>{proj.description}</p>
              </div>
            </div>
            <div className="mt-8 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-[-20px]">
              <span className="text-2xl font-bold uppercase tracking-widest">→</span >
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;
