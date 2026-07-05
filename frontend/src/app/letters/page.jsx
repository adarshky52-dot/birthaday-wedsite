'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Heart, Calendar, MailOpen, Mail, Send } from 'lucide-react';
import Tilt from '../../components/Tilt';


// Typewriter component for letter typing animation
function Typewriter({ text, speed = 30 }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let idx = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(idx));
      idx++;
      if (idx >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <p className="text-sm font-sans leading-relaxed text-slate-800 whitespace-pre-line">{displayedText}</p>;
}

export default function Letters() {
  const [openLetterId, setOpenLetterId] = useState(null);

  // Fetch letters
  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters'],
    queryFn: async () => {
      const response = await api.get('/api/content/letters');
      return response.data;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-4">
          Love Letters
        </h1>
        <p className="text-sm uppercase tracking-widest text-romantic-pink font-semibold">
          Spoken from the heart, penned with love, preserved for eternity
        </p>
      </div>

      {/* Loading letters */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border-white/5">
          <Heart className="w-10 h-10 text-white/25 mx-auto mb-3" />
          <p className="text-white/50 font-serif italic text-sm">No letters written yet. Log in to the Admin Dashboard to write her a love letter!</p>
        </div>
      ) : (
        /* Envelope Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {letters.map((letter) => {
            const isOpen = openLetterId === letter._id;

            return (
              <div key={letter._id} className="flex flex-col items-center">
                {/* Envelope Container for 3D Perspective */}
                <div className="envelope-container select-none">
                  {/* Wrap in Tilt for hover tilt & glare specular highlight */}
                  <Tilt max={10} className="w-full h-full rounded-xl">
                    <div
                      onClick={() => setOpenLetterId(isOpen ? null : letter._id)}
                      className={`envelope-3d ${isOpen ? 'open' : ''}`}
                    >
                      {/* Back Wall */}
                      <div className="envelope-3d-back" />

                      {/* Letter Preview sliding card inside */}
                      <div className="envelope-3d-letter-preview flex flex-col justify-between items-start">
                        <div className="flex flex-col gap-1 w-full text-left">
                          <span className="text-3xs text-rose-600 font-bold uppercase tracking-widest">Confidential</span>
                          <span className="text-xs font-serif font-bold text-rose-950 truncate max-w-full">{letter.title}</span>
                          <span className="text-4xs text-slate-500 font-semibold">{letter.date}</span>
                        </div>
                        <div className="flex justify-end w-full text-4xs font-love text-rose-700 font-bold">
                          Read letter...
                        </div>
                      </div>

                      {/* Front Pocket triangles */}
                      <div className="envelope-3d-pocket" />
                      <div className="envelope-3d-bottom" />

                      {/* Top flap */}
                      <div className="envelope-3d-flap" />

                      {/* Seal sticker */}
                      <div className="envelope-3d-seal w-7 h-7 rounded-full bg-rose-600 border border-white/10 flex items-center justify-center shadow-md">
                        <Heart className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
                      </div>
                    </div>
                  </Tilt>
                </div>

                {/* Subtitle helper click description */}
                <p className="text-3xs uppercase tracking-widest text-white/40 mt-3 font-semibold">
                  {isOpen ? 'Click to close letter' : 'Click to open letter'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-in Letter Paper Detail lightbox */}
      <AnimatePresence>
        {openLetterId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenLetterId(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* The luxury paper card */}
            {(() => {
              const activeLetter = letters.find((l) => l._id === openLetterId);
              if (!activeLetter) return null;

              return (
                <motion.div
                  initial={{ y: 150, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 150, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 22 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl bg-amber-50 rounded-3xl p-6 md:p-10 shadow-[0_20px_50px_rgba(230,198,135,0.4)] border border-amber-200/50 text-slate-800 relative overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 2rem',
                    lineHeight: '2rem'
                  }}
                >
                  {/* Heart margin top left banner */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-2xs uppercase tracking-widest font-bold font-sans">Strictly Confidential</span>
                  </div>

                  {/* Header Title */}
                  <div className="border-b border-rose-200/50 pb-6 mb-8 mt-4 text-left">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-rose-800 leading-tight">
                      {activeLetter.title}
                    </h2>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mt-1 font-sans">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeLetter.date}
                    </div>
                  </div>

                  {/* Letter text with typewriter animation */}
                  <div className="min-h-[200px] mb-8 pr-4">
                    <Typewriter text={activeLetter.content} speed={25} />
                  </div>

                  {/* Signature details */}
                  <div className="text-right border-t border-rose-200/50 pt-6 mt-8 font-love text-3xl text-rose-700">
                    {activeLetter.signature || 'Yours Forever ❤️'}
                  </div>

                  {/* Envelope close button bottom indicator */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setOpenLetterId(null)}
                      className="px-6 py-2 rounded-full bg-rose-800 text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-rose-700 transition-colors shadow-md"
                    >
                      Close Letter
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
