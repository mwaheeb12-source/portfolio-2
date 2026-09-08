import React, { useState } from 'react';
import { motion } from 'framer-motion';

const services = [
  { id: '01', title: 'Web Engineering' },
  { id: '02', title: 'E-Commerce Solutions' },
  { id: '03', title: 'Mobile Applications' },
  { id: '04', title: 'UI/UX Design' },
  { id: '05', title: 'Digital Marketing' }
];

const Services = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5, staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { type: "spring", damping: 25, stiffness: 120 }
    },
    exit: { x: 100, opacity: 0 }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 flex flex-col justify-center px-[10vw] pointer-events-auto mix-blend-difference"
    >
      <div className="w-full max-w-5xl">
        <h2 className="text-sm font-medium tracking-widest uppercase mb-12 text-gray-400">Our Expertise</h2>
        
        <div className="flex flex-col">
          {services.map((svc, idx) => (
            <motion.div 
              key={svc.id}
              variants={itemVariants}
              className="group relative border-b border-white/10 py-6 md:py-8 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-8">
                <span className={`font-display text-sm md:text-lg transition-colors duration-500 ${hoveredIndex === idx ? 'text-white' : 'text-gray-600'}`}>
                  {svc.id}
                </span>
                <h3 className={`font-display text-3xl md:text-6xl uppercase font-bold tracking-tight transition-all duration-500 ${hoveredIndex === idx ? 'text-white translate-x-4' : 'text-gray-500'}`}>
                  {svc.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Services;
