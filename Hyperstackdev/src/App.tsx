import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import Process from './components/Process';
import Services from './components/Services';
import Work from './components/Work';
import Contact from './components/Contact';
import Cursor from './components/Cursor';
import WebGLBackground from './components/WebGLBackground';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 6; 
  // 0: Hero, 1: Story, 2: Process, 3: Services, 4: Work, 5: Contact

  useEffect(() => {
    let lastWheelTime = 0;
    
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 1000) return; // debounce 1 second
      
      if (e.deltaY > 50 && currentSlide < totalSlides - 1) {
        setCurrentSlide(prev => prev + 1);
        lastWheelTime = now;
      } else if (e.deltaY < -50 && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
        lastWheelTime = now;
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide]);

  return (
    <div className="relative w-screen h-screen overflow-hidden selection:bg-accent selection:text-white">
      <Cursor />
      <WebGLBackground />
      <Navbar currentSlide={currentSlide} setSlide={setCurrentSlide} />
      
      <main className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentSlide === 0 && <Hero key="hero" />}
          {currentSlide === 1 && <Story key="story" />}
          {currentSlide === 2 && <Process key="process" />}
          {currentSlide === 3 && <Services key="services" />}
          {currentSlide === 4 && <Work key="work" />}
          {currentSlide === 5 && <Contact key="contact" />}
        </AnimatePresence>
      </main>
      
      {/* Slide Indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 pointer-events-auto">
        {[...Array(totalSlides)].map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${currentSlide === i ? 'bg-white scale-150 shadow-[0_0_10px_white]' : 'bg-white/20 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
