import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 100, opacity: 0, rotateX: -45 },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0,
      transition: { type: "spring", damping: 20, stiffness: 100 }
    }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto mix-blend-difference"
      style={{ perspective: 1000 }}
    >
      <div className="text-center">
        <motion.div variants={itemVariants} className="overflow-hidden mb-2">
          <h1 className="text-[12vw] md:text-[8vw] leading-none font-display font-bold tracking-tighter text-white uppercase">
            Digital
          </h1>
        </motion.div>
        
        <motion.div variants={itemVariants} className="overflow-hidden mb-8">
          <h1 className="text-[12vw] md:text-[8vw] leading-none font-display font-bold tracking-tighter text-white uppercase">
            Evolution
          </h1>
        </motion.div>
        
        <motion.p variants={itemVariants} className="max-w-md mx-auto text-sm md:text-base text-gray-300 font-light px-6">
          We architect immersive, performance-optimized digital experiences that bridge the gap between complex engineering and human-centered design.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default Hero;
