'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRomanticAudio } from '../context/AudioContext';
import { Heart, Music, Sparkles, Compass } from 'lucide-react';
import Tilt from '../components/Tilt';
import Timeline from './timeline/page';
import Memories from './memories/page';
import Letters from './letters/page';
import VoiceNotes from './voice/page';
import Videos from './videos/page';
import BirthdaySurprise from './surprise/page';



export default function LandingPage() {
  const { isPlaying, togglePlay } = useRomanticAudio();
  const [timeLeft, setTimeLeft] = useState({ years: 0, months: 0, days: 0, hours: 0, mins: 0, secs: 0 });
  const canvasRef = useRef(null);

  // Set the anniversary date (e.g., March 18, 2023) to count UP our relationship
  const anniversaryDate = new Date('2023-03-18T00:00:00');

  // Set up intersection observer to dispatch active section ID to background manager
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Trigger zones adjusted for header alignment
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const event = new CustomEvent('galaxy-section-change', { detail: { sectionId } });
          window.dispatchEvent(event);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);


  useEffect(() => {
    const updateAnniversary = () => {
      const now = new Date();
      const diff = now - anniversaryDate;

      // Calculate simple years, months, days together
      let years = now.getFullYear() - anniversaryDate.getFullYear();
      let months = now.getMonth() - anniversaryDate.getMonth();
      let days = now.getDate() - anniversaryDate.getDate();

      if (days < 0) {
        months -= 1;
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += previousMonth.getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setTimeLeft({ years, months, days, hours, mins, secs });
    };

    updateAnniversary();
    const interval = setInterval(updateAnniversary, 1000);
    return () => clearInterval(interval);
  }, []);

  // Floating canvas hearts animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const hearts = [];
    const maxHearts = 35;

    class HeartParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // scatter initially
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.size = Math.random() * 8 + 5;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = Math.sin(Math.random() * 2) * 0.5;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.scaleSpeed = Math.random() * 0.002 + 0.001;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.opacity -= this.scaleSpeed;
        if (this.opacity <= 0 || this.y < -20) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff8da1';
        ctx.beginPath();
        // Drawing heart path
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        ctx.bezierCurveTo(
          this.x - this.size / 2, this.y - this.size / 2, 
          this.x - this.size, this.y + this.size / 3, 
          this.x, this.y + this.size
        );
        ctx.bezierCurveTo(
          this.x + this.size, this.y + this.size / 3, 
          this.x + this.size / 2, this.y - this.size / 2, 
          this.x, this.y + topCurveHeight
        );
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < maxHearts; i++) {
      hearts.push(new HeartParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach((heart) => {
        heart.update();
        heart.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-24 w-full">
      {/* 1. HOME SECTION */}
      <section id="home" className="relative min-h-[80vh] flex flex-col justify-center items-center overflow-visible scroll-mt-28">
        {/* Local hearts canvas layer */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

        <div className="max-w-4xl text-center z-10 px-4 flex flex-col justify-center items-center">
          
          {/* Animated Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex items-center gap-2 mb-4 bg-white/60 border border-rose-200/40 px-4 py-1.5 rounded-full backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
            <span className="text-xs uppercase tracking-widest text-purple-700 font-semibold">
              Dedicated to the most beautiful soul
            </span>
          </motion.div>

          {/* Happy Birthday Message in Elegant Typography */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            className="text-5xl md:text-8xl font-serif font-black tracking-tight text-rose-950 mb-6 leading-tight drop-shadow-[0_10px_20px_rgba(224,92,117,0.05)]"
          >
            Happy Birthday, <br />
            <span className="bg-gradient-to-r from-[#e05c75] via-[#a855f7] to-[#e6c687] bg-clip-text text-transparent drop-shadow-sm">
              My Beautiful Queen
            </span>
          </motion.h1>

          {/* Romantic Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-lg md:text-xl font-light text-rose-950/80 max-w-2xl font-serif italic mb-10 leading-relaxed"
          >
            "Of all the chapters in my life, meeting you will always be my favorite. In your eyes, I found my home, and in your heart, I found my love."
          </motion.p>

          {/* Count Up Together Timer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="w-full mb-12"
          >
            <Tilt className="w-full glass-panel rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(224,92,117,0.06)] border-rose-100/30 hover:border-rose-400/25 transition-all duration-500">
              <h2 className="text-xs uppercase tracking-widest text-rose-900/60 font-bold mb-6 flex justify-center items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 animate-pulse" />
                Time We Have Loved Each Other
              </h2>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-950 font-serif">{timeLeft.years}</span>
                  <span className="text-2xs text-rose-900/50 uppercase tracking-widest mt-1">Years</span>
                </div>
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-950 font-serif">{timeLeft.months}</span>
                  <span className="text-2xs text-rose-900/50 uppercase tracking-widest mt-1">Months</span>
                </div>
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-950 font-serif">{timeLeft.days}</span>
                  <span className="text-2xs text-rose-900/50 uppercase tracking-widest mt-1">Days</span>
                </div>
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-950 font-serif">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-2xs text-rose-900/50 uppercase tracking-widest mt-1">Hours</span>
                </div>
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-950 font-serif">{String(timeLeft.mins).padStart(2, '0')}</span>
                  <span className="text-2xs text-rose-900/50 uppercase tracking-widest mt-1">Mins</span>
                </div>
                <div className="flex flex-col bg-white/40 rounded-2xl p-3 border border-rose-100/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-rose-600 font-serif">{String(timeLeft.secs).padStart(2, '0')}</span>
                  <span className="text-2xs text-rose-600/70 uppercase tracking-widest mt-1">Secs</span>
                </div>
              </div>
            </Tilt>
          </motion.div>

          {/* Romantic Navigation Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
          >
            <button
              onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(244,63,94,0.2)] hover:scale-105 transition-all duration-300"
            >
              <Compass className="w-5 h-5 animate-spin-slow" />
              Begin Our Journey
            </button>

            <button
              onClick={togglePlay}
              className={`w-full sm:w-auto px-8 py-4 rounded-full border backdrop-blur-md font-bold tracking-wide flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300 ${
                isPlaying
                  ? 'bg-rose-100 border-rose-300 text-rose-700'
                  : 'bg-white/60 border-rose-200/50 text-rose-900 hover:bg-white'
              }`}
            >
              <Music className={`w-5 h-5 ${isPlaying ? 'animate-bounce' : ''}`} />
              {isPlaying ? 'Pause Background Music' : 'Play Background Music'}
            </button>
          </motion.div>

        </div>
      </section>

      {/* 2. TIMELINE SECTION */}
      <section id="timeline" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <Timeline />
      </section>

      {/* 3. MEMORIES SECTION */}
      <section id="memories" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <Memories />
      </section>

      {/* 4. LETTERS SECTION */}
      <section id="letters" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <Letters />
      </section>

      {/* 5. VOICE NOTES SECTION */}
      <section id="voice" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <VoiceNotes />
      </section>

      {/* 6. VIDEOS SECTION */}
      <section id="videos" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <Videos />
      </section>

      {/* 7. SURPRISE SECTION */}
      <section id="surprise" className="scroll-mt-28 py-16 border-t border-rose-200/10">
        <BirthdaySurprise />
      </section>
    </div>
  );
}
