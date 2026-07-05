'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRomanticAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Play, Pause, Heart, ShieldAlert } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/memories', label: 'Memories' },
  { href: '/letters', label: 'Letters' },
  { href: '/voice', label: 'Voice Notes' },
  { href: '/videos', label: 'Videos' },
  { href: '/surprise', label: 'Surprise' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isPlaying, togglePlay, currentTrackName } = useRomanticAudio();
  const { admin, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleSectionChange = (e) => {
      setActiveSection(e.detail.sectionId);
    };
    window.addEventListener('galaxy-section-change', handleSectionChange);
    return () => window.removeEventListener('galaxy-section-change', handleSectionChange);
  }, []);

  const getActiveState = (href) => {
    if (pathname !== '/') return pathname === href;
    const targetSection = href === '/' ? 'home' : href.substring(1);
    return activeSection === targetSection;
  };

  const handleLinkClick = (e, href) => {
    if (pathname === '/' && href.startsWith('/') && href !== '/login' && href !== '/admin') {
      e.preventDefault();
      const sectionId = href === '/' ? 'home' : href.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href === '/' ? '/' : `#${sectionId}`);
      }
    }
    setIsOpen(false);
  };


  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50">
      <div className="bg-white/70 border border-rose-200/50 backdrop-blur-xl rounded-full px-6 py-3 shadow-[0_8px_32px_rgba(224,92,117,0.06)] flex items-center justify-between transition-all duration-300">
        
        {/* Title / Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Heart className="w-5 h-5 text-rose-500 group-hover:scale-125 transition-transform duration-300 fill-rose-500/20" />
          <span className="font-semibold text-lg tracking-wide bg-gradient-to-r from-rose-600 via-purple-600 to-rose-400 bg-clip-text text-transparent">
            Our Love Story ❤️
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = getActiveState(link.href);
            return (
              <Link
                key={link.href}
                href={pathname === '/' ? `#${link.href === '/' ? 'home' : link.href.substring(1)}` : link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.15)] border border-rose-600/10'
                    : 'text-rose-950/70 hover:text-rose-950 hover:bg-rose-100/50 border border-transparent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls (Music + Admin Dashboard) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Background Music Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
              isPlaying
                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-[pulse_3s_infinite]'
                : 'bg-white/60 text-rose-900/70 hover:text-rose-900 border border-rose-200/50'
            }`}
            title={`Current: ${currentTrackName}`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-0.5 bg-rose-600 animate-[bounce_0.8s_infinite]"></span>
                  <span className="w-0.5 bg-rose-600 animate-[bounce_0.8s_0.2s_infinite]"></span>
                  <span className="w-0.5 bg-rose-600 animate-[bounce_0.8s_0.4s_infinite]"></span>
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play Music</span>
              </>
            )}
          </button>

          {/* Admin panel status */}
          {admin ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium"
              >
                Admin
              </Link>
              <button
                onClick={logout}
                className="text-xs text-rose-900/60 hover:text-rose-900 underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full bg-white/60 border border-rose-200/50 hover:bg-white transition-all text-xs font-semibold text-rose-900/80"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Small screen Play Button */}
          <button
            onClick={togglePlay}
            className={`p-2 rounded-full border transition-all ${
              isPlaying
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-white/60 border-rose-200/50 text-rose-800'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-rose-900 hover:text-rose-600 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden mt-2 bg-white/95 border border-rose-200/50 backdrop-blur-2xl rounded-2xl p-4 shadow-xl flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = getActiveState(link.href);
            return (
              <Link
                key={link.href}
                href={pathname === '/' ? `#${link.href === '/' ? 'home' : link.href.substring(1)}` : link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white border-l-4 border-rose-600'
                    : 'text-rose-950/70 hover:text-rose-950 hover:bg-rose-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="h-px bg-rose-200/40 my-1"></div>

          {/* Admin panel status Mobile */}
          {admin ? (
            <div className="flex items-center justify-between px-4 pt-2">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-emerald-700 flex items-center gap-1"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="text-xs text-rose-900/60 underline"
              >
                Logout Admin
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 text-center rounded-xl bg-white border border-rose-200 text-sm font-medium text-rose-900/80 hover:bg-rose-50"
            >
              Admin Dashboard Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
