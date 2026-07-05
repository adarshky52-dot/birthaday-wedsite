'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getMediaUrl } from '../../services/api';
import ImageTrail from '../../components/ImageTrail';
import Tilt from '../../components/Tilt';

import { 
  Maximize2, Minimize2, ChevronLeft, ChevronRight, X, Play, Square, 
  Heart, Sparkles, ZoomIn, ZoomOut, Sliders, Settings, Grid, Filter, Calendar, RefreshCw
} from 'lucide-react';

// Preloaded romantic memory placeholders shown if the user hasn't added custom logs yet
const fallbackMemories = [
  { _id: 'm1', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', title: 'Holding Hands in Paris', caption: 'Two souls, sharing a single heartbeat under the autumn breeze.', date: 'October 12, 2023', category: 'Travel' },
  { _id: 'm2', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop', title: 'A Special Birthday Wish', caption: 'Every rose speaks of the promises and beautiful memories we share.', date: 'December 04, 2023', category: 'Celebration' },
  { _id: 'm3', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', title: 'Doodles of Our Future', caption: 'Simple drawings that represent infinite emotions and plans.', date: 'February 14, 2024', category: 'Milestone' },
  { _id: 'm4', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop', title: 'Anniversary Balloons', caption: 'Celebrating another year of laughter, growth, and endless love.', date: 'June 20, 2024', category: 'Celebration' },
  { _id: 'm5', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop', title: 'Hiking the Peaks Together', caption: 'Conquering heights, standing hand-in-hand above the clouds.', date: 'August 18, 2024', category: 'Travel' },
  { _id: 'm6', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop', title: 'Your Radiant Smile', caption: 'Your happy smile captured in the golden hour is my favorite memory.', date: 'November 11, 2024', category: 'General' },
  { _id: 'm7', imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop', title: 'Sunset Beach Picnic', caption: 'Watching the soft waves, sharing cozy talks and warm hot chocolate.', date: 'January 05, 2025', category: 'Dates' }
];

export default function Memories() {
  const [viewMode, setViewMode] = useState('trail'); // 'trail' | 'grid'
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Stores index of photo open in lightbox
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Custom trail parameters
  const [trailVariant, setTrailVariant] = useState(1);
  const [imageWidth, setImageWidth] = useState(220); // 120px to 350px
  const [sensitivity, setSensitivity] = useState(80); // Distance threshold (px)
  const [activePhotoIds, setActivePhotoIds] = useState(new Set());
  const [isFullscreenCanvas, setIsFullscreenCanvas] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  // Fetch memories data
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['memories'],
    queryFn: async () => {
      const response = await api.get('/api/content/memories');
      return response.data;
    }
  });

  const allMemories = memories.length > 0 ? memories : fallbackMemories;

  // Categories extraction
  const categories = ['All', ...new Set(allMemories.map(m => m.category || 'General'))];

  // Filtering memories list
  const filteredMemories = activeFilter === 'All'
    ? allMemories
    : allMemories.filter(m => m.category === activeFilter);

  // Sync active photo IDs when memories load
  useEffect(() => {
    if (allMemories.length > 0 && activePhotoIds.size === 0) {
      const memoriesWithImages = allMemories.filter(m => m.imageUrl);
      setActivePhotoIds(new Set(memoriesWithImages.map(m => m._id)));
    }
  }, [allMemories, activePhotoIds]);

  // Block download keys & shortcuts
  useEffect(() => {
    const handleKeyActions = (e) => {
      if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'u') || e.key === 'F12') {
        e.preventDefault();
        alert('Downloading photos is disabled to protect our memory album! ❤️');
      }
    };
    window.addEventListener('keydown', handleKeyActions);
    return () => window.removeEventListener('keydown', handleKeyActions);
  }, []);

  // Slideshow auto play effect for lightbox
  useEffect(() => {
    let intervalId;
    const memoriesWithImages = allMemories.filter(m => m.imageUrl);
    if (isPlayingSlideshow && selectedPhoto !== null && memoriesWithImages.length > 0) {
      intervalId = setInterval(() => {
        setZoomLevel(1);
        setSelectedPhoto((prev) => (prev + 1) % memoriesWithImages.length);
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isPlayingSlideshow, selectedPhoto, allMemories]);

  // Navigate lightbox photos
  const memoriesWithImages = allMemories.filter(m => m.imageUrl);

  const handlePrev = (e) => {
    e.stopPropagation();
    setZoomLevel(1);
    setSelectedPhoto((prev) => (prev === 0 ? memoriesWithImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setZoomLevel(1);
    setSelectedPhoto((prev) => (prev === memoriesWithImages.length - 1 ? 0 : prev + 1));
  };

  const toggleSlideshow = (e) => {
    e.stopPropagation();
    setIsPlayingSlideshow(!isPlayingSlideshow);
  };

  // Toggle specific photo in trail loop
  const togglePhotoActive = (id) => {
    const nextSet = new Set(activePhotoIds);
    if (nextSet.has(id)) {
      if (nextSet.size <= 1) {
        alert('Please keep at least one active photo for the trail!');
        return;
      }
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }
    setActivePhotoIds(nextSet);
  };

  // Get active photo URLs for the trail
  const trailImageUrls = allMemories
    .filter(m => m.imageUrl && activePhotoIds.has(m._id))
    .map(m => getMediaUrl(m.imageUrl));

  // Style names and short descriptions
  const trailStyles = [
    { id: 1, label: 'Lerp Slide', desc: 'Standard smooth trailing flow' },
    { id: 2, label: 'Zoom Fade', desc: 'Photos scale down and disappear' },
    { id: 3, label: 'Speed Spin', desc: 'Slightly rotates based on speed' },
    { id: 4, label: 'Smooth Drift', desc: 'Slowly drifts in motion direction' },
    { id: 5, label: 'Delayed Reveal', desc: 'Creates a subtle trailing latency' },
    { id: 6, label: 'Flash Reveal', desc: 'Instant flash reveal and fade' },
    { id: 7, label: 'Scatter Play', desc: 'Random scale and rotation scattering' },
    { id: 8, label: '3D Tilt Portal', desc: 'Immersive 3D perspective and brightness tilt' }
  ];

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 transition-all duration-300 ${isFullscreenCanvas && viewMode === 'trail' ? 'max-w-none !p-0' : ''}`}>
      
      {/* Title Header (Hide in Fullscreen canvas) */}
      {(!isFullscreenCanvas || viewMode !== 'trail') && (
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-3">
            Our Memory Museum
          </h1>
          <p className="text-sm uppercase tracking-widest text-romantic-pink font-semibold flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 fill-romantic-pink animate-pulse" />
            Hover and play with our timeline scrapbook of love memories
          </p>
        </div>
      )}

      {/* Mode Switcher Control Bar (Hide in Fullscreen canvas) */}
      {(!isFullscreenCanvas || viewMode !== 'trail') && (
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 border border-white/10 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex gap-1 z-10 backdrop-blur-md">
            <button
              onClick={() => setViewMode('trail')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                viewMode === 'trail'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Magical Scrapbook Trail</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Classic Memories Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Views Container */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* VIEW 1: INTERACTIVE SCRAPBOOK IMAGE TRAIL */}
          {viewMode === 'trail' && (
            <div className={`relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-crosshair transition-all duration-300 ${
              isFullscreenCanvas 
                ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen bg-[#05010ded]' 
                : 'h-[500px] md:h-[650px] w-full bg-gradient-to-br from-[#0c0517] to-[#160b2b]'
            }`}>
              
              {/* Starry space overlay backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.08),transparent_70%)] pointer-events-none" />
              <div className="absolute inset-0 bg-stars opacity-40 pointer-events-none" />

              {/* Instructions Centered Background Hint */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center text-center p-6 z-0">
                <Heart className="w-12 h-12 text-rose-400/20 mb-3 animate-pulse fill-rose-400/5" />
                <h3 className="text-xl font-serif font-bold text-white/40 select-none">
                  Digital Love Scrapbook Canvas
                </h3>
                <p className="text-xs text-white/30 max-w-xs mt-1 leading-relaxed select-none">
                  Move your cursor or swipe your finger across this screen to draw a trail of shared memories.
                </p>
              </div>

              {/* Render ImageTrail Component */}
              <ImageTrail 
                items={trailImageUrls} 
                variant={trailVariant} 
                threshold={sensitivity} 
                imageWidth={imageWidth} 
              />

              {/* Floating Fullscreen Exit Button (Visible in Fullscreen Mode Only) */}
              {isFullscreenCanvas && (
                <button
                  onClick={() => setIsFullscreenCanvas(false)}
                  className="absolute top-6 left-6 p-3 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 transition-all z-40 shadow-lg flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </button>
              )}

              {/* Collapsible/Expandable floating Options Panel */}
              <div className={`absolute transition-all duration-300 z-30 ${
                isFullscreenCanvas 
                  ? 'bottom-6 right-6 max-h-[85vh] md:max-h-none' 
                  : 'bottom-4 right-4 max-h-[92%] md:max-h-none'
                } flex flex-col items-end gap-2`}
              >
                
                {/* Control Panel Toggle Icon */}
                {!showConfigPanel && (
                  <button
                    onClick={() => setShowConfigPanel(true)}
                    className="p-3.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-rose-400/40 shadow-2xl transition-all backdrop-blur-xl flex items-center gap-2 cursor-pointer scale-100 hover:scale-105 active:scale-95"
                    title="Open Customizer"
                  >
                    <Sliders className="w-4 h-4 text-rose-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-200">Customizer</span>
                  </button>
                )}

                {/* Actual Panel Box */}
                <AnimatePresence>
                  {showConfigPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="w-[320px] sm:w-[360px] glass-panel border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4 text-left overflow-y-auto max-h-[380px] sm:max-h-[500px]"
                    >
                      {/* Header Controls */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-rose-300 animate-spin-slow" />
                          <span className="font-serif font-bold text-white text-md">Trail Designer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {/* Fullscreen toggle button */}
                          <button
                            onClick={() => setIsFullscreenCanvas(!isFullscreenCanvas)}
                            className="p-1.5 rounded-md hover:bg-white/5 text-white/70 hover:text-white transition-colors"
                            title={isFullscreenCanvas ? "Exit Fullscreen" : "Enter Fullscreen"}
                          >
                            {isFullscreenCanvas ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </button>
                          {/* Close widget button */}
                          <button
                            onClick={() => setShowConfigPanel(false)}
                            className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 1. Custom presets selection grid */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-3xs uppercase font-bold text-white/40 tracking-wider">Motion Presets</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {trailStyles.map((style) => (
                            <button
                              key={style.id}
                              onClick={() => setTrailVariant(style.id)}
                              className={`px-2.5 py-1.5 rounded-lg text-left transition-all duration-300 border ${
                                trailVariant === style.id
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                                  : 'bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                              title={style.desc}
                            >
                              <div className="text-xs font-semibold truncate">{style.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Image size adjustment slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-3xs uppercase font-bold text-white/40 tracking-wider">
                          <span>Image Size</span>
                          <span className="text-rose-300 font-mono text-2xs">{imageWidth}px</span>
                        </div>
                        <input
                          type="range"
                          min="120"
                          max="350"
                          step="10"
                          value={imageWidth}
                          onChange={(e) => setImageWidth(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer h-1 bg-white/10 rounded-lg outline-none"
                        />
                      </div>

                      {/* 3. Sensitivity / Threshold distance slider */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-3xs uppercase font-bold text-white/40 tracking-wider">
                          <span>Trail Spacing (Sensitivity)</span>
                          <span className="text-rose-300 font-mono text-2xs">{sensitivity}px</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="160"
                          step="5"
                          value={sensitivity}
                          onChange={(e) => setSensitivity(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer h-1 bg-white/10 rounded-lg outline-none"
                        />
                        <span className="text-4xs text-white/30 italic">Lower values create a more dense trail of photos.</span>
                      </div>

                      {/* 4. Choose customized photos selector checklist */}
                      <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                        <div className="flex justify-between items-center">
                          <label className="text-3xs uppercase font-bold text-white/40 tracking-wider">
                            Choose Active Photos ({activePhotoIds.size})
                          </label>
                          <button 
                            onClick={() => {
                              const memoriesWithImages = allMemories.filter(m => m.imageUrl);
                              setActivePhotoIds(new Set(memoriesWithImages.map(m => m._id)));
                            }}
                            className="text-4xs uppercase tracking-widest text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-1 font-semibold"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Reset All
                          </button>
                        </div>
                        
                        {/* Horizontal scrolling tiny thumbnails */}
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin select-none">
                          {allMemories.filter(m => m.imageUrl).map((photo) => {
                            const isActive = activePhotoIds.has(photo._id);
                            return (
                              <div
                                key={photo._id}
                                onClick={() => togglePhotoActive(photo._id)}
                                className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 ${
                                  isActive
                                    ? 'border-rose-400 scale-95 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                    : 'border-white/10 opacity-40 hover:opacity-75 scale-90'
                                }`}
                                title={photo.title}
                              >
                                <img
                                  src={getMediaUrl(photo.imageUrl)}
                                  alt={photo.title || 'Thumbnail'}
                                  className="w-full h-full object-cover"
                                />
                                {isActive && (
                                  <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                                    <Heart className="w-4 h-4 fill-rose-500 text-rose-100" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* VIEW 2: CLASSIC MEMORY LOGS LIST */}
          {viewMode === 'grid' && (
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-2 text-left">
                  <Sparkles className="w-5 h-5 text-rose-300 animate-pulse" />
                  Memory Logs
                </h2>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-4 h-4 text-white/30 hidden sm:block" />
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                        activeFilter === category
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          : 'bg-white/5 text-white/60 hover:text-white border border-transparent'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMemories.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-3xl border-white/5">
                  <Heart className="w-10 h-10 text-white/25 mx-auto mb-3" />
                  <p className="text-white/50 font-serif italic text-sm">No memory logs written yet under this category. Open Admin panel to add memories!</p>
                </div>
              ) : (
                /* Masonry Pinterest-like column layout */
                <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
                  <AnimatePresence>
                    {filteredMemories.map((m, index) => (
                      <motion.div
                        key={m._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                          if (m.imageUrl) {
                            const indexInImages = memoriesWithImages.findIndex(imgMem => imgMem._id === m._id);
                            if (indexInImages !== -1) {
                              setSelectedPhoto(indexInImages);
                              setZoomLevel(1);
                            }
                          }
                        }}
                        className="break-inside-avoid mb-6"
                      >
                        <Tilt className={`glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-md hover:border-rose-400/20 transition-all duration-300 flex flex-col ${
                          m.imageUrl ? 'cursor-pointer' : ''
                        }`}>
                          {/* Memory Image */}
                          {m.imageUrl && (
                            <div className="relative overflow-hidden group">
                              <img
                                src={getMediaUrl(m.imageUrl)}
                                alt={m.title}
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                                loading="lazy"
                                draggable="false"
                              />
                              <div className="absolute inset-0 bg-[#0c0517]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white drop-shadow-md scale-75 group-hover:scale-100 transition-transform duration-300" />
                              </div>
                            </div>
                          )}

                          {/* Body Content */}
                          <div className="p-5 text-left flex flex-col gap-2">
                            <div className="flex items-center justify-between text-2xs text-rose-300 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {m.date}
                              </span>
                              <span>{m.category || 'General'}</span>
                            </div>
                            <h4 className="text-lg font-serif font-bold text-white">{m.title}</h4>
                            <p className="text-xs text-white/70 leading-relaxed font-sans">{m.caption}</p>
                          </div>
                        </Tilt>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedPhoto !== null && memoriesWithImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedPhoto(null);
              setIsPlayingSlideshow(false);
            }}
            className="fixed inset-0 z-50 bg-[#06020fed]/95 backdrop-blur-md flex items-center justify-center p-4"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Top Toolbar panel */}
            <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
              {/* Play / Stop Slideshow */}
              <button
                onClick={toggleSlideshow}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 transition-all flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
              >
                {isPlayingSlideshow ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Pause Slideshow</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Play Slideshow</span>
                  </>
                )}
              </button>

              {/* Zoom Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((prev) => Math.min(prev + 0.5, 3));
                }}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((prev) => Math.max(prev - 0.5, 1));
                }}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedPhoto(null);
                  setIsPlayingSlideshow(false);
                }}
                className="p-2.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Left Nav Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 z-40"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Lightbox Center Image Card */}
            <div
              className="max-w-4xl max-h-[80vh] w-full flex flex-col justify-center items-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={selectedPhoto}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoomLevel }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={getMediaUrl(memoriesWithImages[selectedPhoto].imageUrl)}
                alt={memoriesWithImages[selectedPhoto].title}
                draggable="false"
                className="max-h-[70vh] max-w-full object-contain rounded-2xl select-none pointer-events-none shadow-2xl border border-white/10"
              />

              {/* Caption */}
              <div className="text-center mt-6 max-w-lg">
                <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">
                  {memoriesWithImages[selectedPhoto].title || 'Sweet Memory'}
                </h3>
                {memoriesWithImages[selectedPhoto].caption && (
                  <p className="text-sm text-white/60 mt-2 italic font-serif">
                    "{memoriesWithImages[selectedPhoto].caption}"
                  </p>
                )}
              </div>
            </div>

            {/* Right Nav Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/15 z-40"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
