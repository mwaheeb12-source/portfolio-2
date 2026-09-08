import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ currentSlide, setSlide }: { currentSlide: number, setSlide: (n: number) => void }) => {
  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-8 pointer-events-auto mix-blend-difference"
    >
      <div className="font-display font-bold text-2xl tracking-tighter text-white cursor-pointer" onClick={() => setSlide(0)}>
        HYPERSTACK<span className="text-gray-400 font-light">DEV</span>
      </div>
      
      <div className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-medium text-white">
        <button onClick={() => setSlide(1)} className={`hover:text-gray-400 transition-colors ${currentSlide === 1 ? 'text-gray-400' : ''}`}>Story</button>
        <button onClick={() => setSlide(2)} className={`hover:text-gray-400 transition-colors ${currentSlide === 2 ? 'text-gray-400' : ''}`}>Process</button>
        <button onClick={() => setSlide(3)} className={`hover:text-gray-400 transition-colors ${currentSlide === 3 ? 'text-gray-400' : ''}`}>Expertise</button>
        <button onClick={() => setSlide(4)} className={`hover:text-gray-400 transition-colors ${currentSlide === 4 ? 'text-gray-400' : ''}`}>Work</button>
      </div>
      
      <button onClick={() => setSlide(5)} className="text-xs uppercase tracking-widest font-medium text-white border-b border-white/30 pb-1 hover:border-white transition-colors">
        Contact
      </button>
    </motion.nav>
  );
};

export default Navbar;
