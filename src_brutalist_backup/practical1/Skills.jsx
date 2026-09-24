function Skills({ skillList, theme }) {
  if (!skillList || skillList.length === 0) {
    return <p className="py-12 text-center text-[#86868b] font-medium">No skills to display.</p>;
  }

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t-2 border-black dark:border-white mt-12">
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-16 opacity-50">Core Competencies</h2>
      <ul className="flex flex-wrap gap-4 list-none p-0">
        {skillList.map((skill) => (
          <li 
            key={skill} 
            className={`px-8 py-4 font-bold text-xl md:text-2xl uppercase tracking-widest border-2 transition-all ${
              theme === 'dark' 
                ? 'border-white text-white hover:bg-white hover:text-[#111111]' 
                : 'border-black text-[#111111] hover:bg-[#111111] hover:text-white'
            }`}
          >
            {skill}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
