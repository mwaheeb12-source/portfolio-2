import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  { id: 1, title: 'Nexus', type: 'E-Commerce Platform', color: 'text-purple-500' },
  { id: 2, title: 'Aura', type: 'Fintech Mobile App', color: 'text-blue-500' },
  { id: 3, title: 'Zenith', type: 'Web3 Architecture', color: 'text-green-500' }
];

const Work = () => {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((i) => (i + 1) % projects.length);
  const prev = () => setIndex((i) => (i - 1 + projects.length) % projects.length);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col justify-center items-center pointer-events-auto mix-blend-difference"
    >
      <div className="absolute top-1/4 left-[10vw]">
        <h2 className="text-sm font-medium tracking-widest uppercase text-gray-400">Featured Work</h2>
      </div>

      <div className="relative w-full h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-center cursor-pointer"
            onClick={next}
          >
            <h3 className={`text-[10vw] md:text-[8vw] leading-none font-display font-bold uppercase ${projects[index].color} text-glow mix-blend-screen`}>
              {projects[index].title}
            </h3>
            <p className="text-xl md:text-2xl text-white tracking-widest uppercase mt-4">
              {projects[index].type}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-[15%] flex gap-8">
        <button onClick={prev} className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Prev</button>
        <span className="text-sm text-gray-600">{index + 1} / {projects.length}</span>
        <button onClick={next} className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Next</button>
      </div>
    </motion.section>
  );
};

export default Work;
