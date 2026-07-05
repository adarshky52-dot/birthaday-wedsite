'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getMediaUrl } from '../../services/api';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles } from 'lucide-react';

export default function BirthdaySurprise() {
  const [step, setStep] = useState(1); // steps 1 to 5
  const [photoIndex, setPhotoIndex] = useState(0);
  const canvasRef = useRef(null);

  // Fetch photos for the montage
  const { data: photos = [] } = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const response = await api.get('/api/content/photos');
      return response.data;
    }
  });

  // Fetch surprise settings
  const { data: surpriseSettings } = useQuery({
    queryKey: ['surprise-settings'],
    queryFn: async () => {
      const response = await api.get('/api/content/surprise-settings');
      return response.data;
    }
  });

  const defaultSettings = {
    giftBoxTitle: "A Surprise For You 🎁",
    giftBoxDesc: "Tap the box below to open your birthday surprise",
    step3Title: "To My Favorite Human",
    step3Message: "Today is the day the world was blessed with your laugh, your kind heart, and your beautiful soul. I am so incredibly lucky to walk by your side.",
    step5Title: "Eternal Love",
    step5Message: "You are the most beautiful chapter of my life. Happy Birthday, My Love ❤️",
    step5Desc: "May your birthday be filled with the same infinite joy and warmth that you bring to my life every single day."
  };

  const settings = surpriseSettings ? { ...defaultSettings, ...surpriseSettings } : defaultSettings;

  const fallbackMontage = [
    'https://picsum.photos/id/1025/500/500',
    'https://picsum.photos/id/1027/500/500',
    'https://picsum.photos/id/1028/500/500',
    'https://picsum.photos/id/1029/500/500'
  ];

  const montagePhotos = photos.length > 0 ? photos.map(p => getMediaUrl(p.imageUrl)) : fallbackMontage;

  // Handle Box Opening
  const handleOpenBox = () => {
    setStep(2);

    // Confetti Explosion
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff8da1', '#d6b5ff', '#ffcba4', '#e6c687', '#ffffff']
    });

    // Heart particle burst (custom parameters)
    const end = Date.now() + (2 * 1000);
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#ff8da1', '#ff5a79', '#ffffff']
      });
    }, 200);

    // Automatically transition to message reveal (Step 3)
    setTimeout(() => {
      setStep(3);
    }, 3000);
  };

  // Step 3 automatically transitions to Photo Montage (Step 4)
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(4);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 4 Slideshow Photo index loop
  useEffect(() => {
    let intervalId;
    if (step === 4) {
      intervalId = setInterval(() => {
        setPhotoIndex((prev) => {
          if (prev >= montagePhotos.length - 1) {
            // End of montage, go to final message reveal (Step 5)
            clearInterval(intervalId);
            setStep(5);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => clearInterval(intervalId);
  }, [step, montagePhotos]);

  // Canvas Fireworks & Floating Hearts logic (triggers on Step 5)
  useEffect(() => {
    if (step !== 5) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fireworks state
    const fireworks = [];
    const particles = [];
    const hearts = [];

    class Firework {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.tx = Math.random() * canvas.width;
        this.ty = Math.random() * (canvas.height * 0.5);
        this.speed = 3.5;
        this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.dist = Math.hypot(this.tx - this.x, this.ty - this.y);
        this.distTraveled = 0;
        this.color = `hsl(${Math.random() * 360}, 100%, 75%)`;
      }
      update() {
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.x += vx;
        this.y += vy;
        this.distTraveled += Math.hypot(vx, vy);

        if (this.distTraveled >= this.dist) {
          // Explode
          for (let i = 0; i < 40; i++) {
            particles.push(new Particle(this.tx, this.ty, this.color));
          }
          return false;
        }
        return true;
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 1;
        this.friction = 0.96;
        this.gravity = 0.08;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
      }
      update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    class FloatingHeart {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 10 + 6;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = Math.sin(Math.random()) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.3;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        if (this.y < -20) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ff5a79';
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        ctx.bezierCurveTo(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size);
        ctx.bezierCurveTo(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y + topCurveHeight);
        ctx.fill();
        ctx.restore();
      }
    }

    // Seed continuous hearts
    for (let i = 0; i < 20; i++) {
      hearts.push(new FloatingHeart());
    }

    const loop = () => {
      ctx.fillStyle = 'rgba(6, 2, 15, 0.2)'; // Clear trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Launch fireworks occasionally
      if (Math.random() < 0.04 && fireworks.length < 5) {
        fireworks.push(new Firework());
      }

      // Update & Draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const keep = fireworks[i].update();
        if (keep) {
          fireworks[i].draw();
        } else {
          fireworks.splice(i, 1);
        }
      }

      // Update & Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const keep = particles[i].update();
        if (keep) {
          particles[i].draw();
        } else {
          particles.splice(i, 1);
        }
      }

      // Update & Draw continuous floating hearts
      hearts.forEach(heart => {
        heart.update();
        heart.draw();
      });

      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [step]);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-visible">
      {/* Background surprise Canvas */}
      {step === 5 && (
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      )}

      <div className="relative w-full max-w-2xl text-center px-4 z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Gift Box Display */}
          {step === 1 && (
            <motion.div
              key="gift"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center justify-center gap-8 cursor-pointer"
              onClick={handleOpenBox}
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-serif font-black text-white mb-2">
                  {settings.giftBoxTitle}
                </h1>
                <p className="text-sm text-white/50 uppercase tracking-widest font-semibold">
                  {settings.giftBoxDesc}
                </p>
              </div>

              {/* Animated Gift box container */}
              <div className="relative w-48 h-48 group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-rose-500/10 blur-xl group-hover:bg-rose-500/25 transition-all rounded-3xl" />
                
                {/* 3D Box graphics */}
                <div className="w-full h-full bg-gradient-to-tr from-rose-600 to-rose-400 rounded-2xl border border-rose-500/40 relative shadow-2xl flex items-center justify-center">
                  {/* Ribbon stripes */}
                  <div className="absolute inset-y-0 w-8 bg-amber-400 border-x border-amber-300/30" />
                  <div className="absolute inset-x-0 h-8 bg-amber-400 border-y border-amber-300/30" />
                  
                  {/* Pulse Sparkles */}
                  <Gift className="w-16 h-16 text-white relative z-10 animate-bounce" />
                </div>
              </div>

              <span className="text-xs uppercase tracking-widest text-rose-300 font-bold animate-pulse">
                Click Box to Open
              </span>
            </motion.div>
          )}

          {/* STEP 2: Box Opening Transition */}
          {step === 2 && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6"
            >
              <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-400 rounded-full animate-spin mb-4"></div>
              <h2 className="text-2xl font-serif font-bold text-rose-200 animate-pulse">
                Opening the Box... ❤️
              </h2>
            </motion.div>
          )}

          {/* STEP 3: Confetti & Core Birthday Greeting Reveal */}
          {step === 3 && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border-white/10 flex flex-col gap-6"
            >
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-rose-300 animate-spin" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                {settings.step3Title}
              </h2>
              <p className="text-base text-white/80 leading-relaxed font-sans font-light">
                {settings.step3Message}
              </p>
              <span className="text-xs text-rose-300/70 font-semibold uppercase tracking-widest">
                Prepare to take a look at us...
              </span>
            </motion.div>
          )}

          {/* STEP 4: Photo Montage Slideshow */}
          {step === 4 && (
            <motion.div
              key="montage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              <h2 className="text-xs uppercase tracking-widest text-white/50 font-bold mb-2">
                Memory Slideshow
              </h2>
              
              <div className="w-80 md:w-[450px] aspect-square rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={photoIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.2 }}
                    src={montagePhotos[photoIndex]}
                    alt={`Scrapbook Montage ${photoIndex}`}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </AnimatePresence>
                
                {/* Visual heart frame stamp */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-3 py-1 text-2xs text-white border border-white/10">
                  {photoIndex + 1} / {montagePhotos.length}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Final Fireworks & Eternal Message */}
          {step === 5 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="glass-panel bg-[#0c0517]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-3xl flex flex-col gap-6 text-center max-w-lg mx-auto"
            >
              <div className="flex justify-center">
                <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-black text-rose-100 leading-tight">
                {settings.step5Title}
              </h2>
              
              <p className="text-lg md:text-2xl font-serif italic text-rose-200/90 leading-relaxed font-semibold">
                "{settings.step5Message}"
              </p>

              <div className="h-px bg-white/10 my-2"></div>
              
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                {settings.step5Desc}
              </p>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 rounded-full bg-rose-600/35 hover:bg-rose-600/50 text-white font-sans text-2xs font-semibold uppercase tracking-widest border border-rose-500/40 transition-colors"
                >
                  Restart Surprise
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
