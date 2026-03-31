'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mascot from './Mascot';
import { TutorialSlide } from '@/lib/tutorials';

interface MascotTutorialProps {
  slides: TutorialSlide[];
  onDismiss: () => void;
}

export default function MascotTutorial({ slides, onDismiss }: MascotTutorialProps) {
  const [index, setIndex] = useState(0);

  const isLast = index === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDismiss();
    } else {
      setIndex(i => i + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="flex flex-col items-center max-w-xs w-full"
        initial={{ scale: 0.8, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
      >
        {/* Mascot */}
        <Mascot
          currentEnergy="medium"
          mood="happy"
          persistent
          size={130}
          message=""
        />

        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="bg-white rounded-3xl px-6 py-5 shadow-2xl mt-4 w-full text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <p className="text-gray-800 font-semibold text-base leading-relaxed mb-5">
              {slides[index].message}
            </p>

            {/* Dots */}
            {slides.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-4">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:      i === index ? 18 : 6,
                      height:     6,
                      background: i === index ? '#22c55e' : '#d1d5db',
                    }}
                  />
                ))}
              </div>
            )}

            <motion.button
              onClick={handleNext}
              className="w-full py-3 rounded-2xl font-black text-white text-base"
              style={{
                background:  '#22c55e',
                boxShadow:   '0 4px 0 0 #15803d',
              }}
              whileTap={{ scale: 0.97, y: 2, boxShadow: '0 2px 0 0 #15803d' }}
            >
              {isLast ? 'Got it!' : 'Next →'}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
