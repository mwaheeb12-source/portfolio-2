import React from 'react';
import { motion } from 'framer-motion';

const Story = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, delay: 0.2, ease: "easeOut" } }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 flex flex-col justify-center items-center px-[10vw] pointer-events-auto mix-blend-difference text-center"
    >
      <div className="max-w-4xl">
        <h2 className="text-sm font-medium tracking-widest uppercase mb-12 text-gray-400">Our Story</h2>
        
        <motion.p variants={textVariants} className="text-3xl md:text-5xl font-display font-light leading-tight text-white mb-8">
          Every great brand has a story. Ours is written in clean code, bold aesthetics, and pixel-perfect execution.
        </motion.p>
        
        <motion.p variants={textVariants} className="text-xl md:text-2xl font-light text-gray-400">
          We exist to challenge the boundaries of what is possible on the web.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default Story;
