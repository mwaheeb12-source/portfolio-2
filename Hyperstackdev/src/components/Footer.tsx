import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 px-8 border-t border-white/5 bg-background text-center text-gray-500 text-sm">
      <div className="font-display font-bold text-lg mb-4 text-white">
        Hyperstack<span className="text-accent text-glow">dev</span>.
      </div>
      <p>© {new Date().getFullYear()} Hyperstackdev. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
