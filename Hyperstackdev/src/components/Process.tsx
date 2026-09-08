import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: '01', title: 'Discover', desc: 'Deep dive into your brand, audience, and goals.' },
  { id: '02', title: 'Design', desc: 'Wireframing, prototyping, and pixel-perfect UI creation.' },
  { id: '03', title: 'Engineer', desc: 'Building robust, scalable, and high-performance architecture.' },
  { id: '04', title: 'Launch', desc: 'Deployment, optimization, and continuous iteration.' }
];

const Process = () => {
  const [activeStep, setActiveStep] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 flex flex-col justify-center px-[10vw] pointer-events-auto mix-blend-difference"
    >
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-start md:items-center">
        
        {/* Left side: Navigation */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <h2 className="text-sm font-medium tracking-widest uppercase mb-4 text-gray-400">Methodology</h2>
          {steps.map((step, idx) => (
            <button 
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`text-left text-2xl md:text-4xl font-display uppercase tracking-tight transition-all duration-300 ${activeStep === idx ? 'text-white translate-x-4' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Right side: Content */}
        <div className="w-full md:w-2/3 pl-0 md:pl-12 border-l-0 md:border-l border-white/20 h-48 relative flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute"
            >
              <div className="text-accent text-lg font-mono mb-2">{steps[activeStep].id}</div>
              <p className="text-2xl md:text-3xl font-light text-white leading-relaxed">
                {steps[activeStep].desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.section>
  );
};

export default Process;
