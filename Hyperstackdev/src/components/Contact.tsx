import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col justify-center items-center pointer-events-auto mix-blend-difference"
    >
      <motion.div 
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="text-center"
      >
        <h2 className="text-xl md:text-3xl font-light text-gray-300 mb-4">Ready to build the future?</h2>
        <a href="mailto:hello@hyperstackdev.com" className="inline-block relative group">
          <h1 className="text-[10vw] md:text-[8vw] leading-none font-display font-bold uppercase text-white transition-transform duration-500 group-hover:scale-105 group-hover:text-accent">
            Let's Talk
          </h1>
          <div className="absolute -bottom-4 left-0 w-0 h-1 bg-accent transition-all duration-500 group-hover:w-full"></div>
        </a>
      </motion.div>

      <div className="absolute bottom-12 flex gap-12 text-sm uppercase tracking-widest font-medium text-gray-500">
        <a href="#" className="hover:text-white transition-colors">Twitter</a>
        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
        <a href="#" className="hover:text-white transition-colors">Instagram</a>
      </div>
    </motion.section>
  );
};

export default Contact;
