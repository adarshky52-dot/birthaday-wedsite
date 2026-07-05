'use client';

import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getMediaUrl } from '../../services/api';
import { Play, Pause, X, Heart, Film, ArrowRight } from 'lucide-react';

// Subcomponent to handle hover preview trigger
function VideoPreviewCard({ video, onClick }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video hover playback blocked:', err));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl cursor-pointer group flex flex-col relative"
    >
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-white/5">
        <video
          ref={videoRef}
          src={getMediaUrl(video.videoUrl)}
          muted
          loop
          playsInline
          className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
        />

        {/* Hover preview blur overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-rose-500/25 backdrop-blur-md border border-rose-400/40 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
            <Play className="w-6 h-6 text-white fill-white pl-0.5" />
          </div>
        </div>

        {/* Preview hover banner indicator */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-3xs text-white/80 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Film className="w-3 h-3 text-rose-300" />
          Hover Preview Active
        </div>
      </div>

      {/* Description Body */}
      <div className="p-5 text-left flex flex-col gap-1.5">
        <h4 className="font-serif font-bold text-lg text-white group-hover:text-rose-300 transition-colors">
          {video.title}
        </h4>
        {video.description && (
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-rose-300 text-3xs font-semibold uppercase tracking-wider mt-2 group-hover:gap-2.5 transition-all">
          <span>Watch Full Memory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await api.get('/api/content/videos');
      return response.data;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-4">
          Video Memories
        </h1>
        <p className="text-sm uppercase tracking-widest text-romantic-pink font-semibold">
          Clips of laughing, beautiful travel logs, and clips of simple everyday joys
        </p>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border-white/5">
          <Heart className="w-10 h-10 text-white/25 mx-auto mb-3" />
          <p className="text-white/50 font-serif italic text-sm">No videos uploaded to our scrapbook yet. Log in to upload memory video files!</p>
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {videos.map((v) => (
            <VideoPreviewCard
              key={v._id}
              video={v}
              onClick={() => setSelectedVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Video Fullscreen modal player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0c0517] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Fullscreen Video tag */}
              <div className="aspect-video w-full bg-black relative">
                <video
                  src={getMediaUrl(selectedVideo.videoUrl)}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Description Body */}
              <div className="p-6 md:p-8 text-left bg-white/5 flex flex-col gap-2">
                <h3 className="text-2xl font-serif font-bold text-white">
                  {selectedVideo.title}
                </h3>
                {selectedVideo.description && (
                  <p className="text-sm text-white/70 leading-relaxed font-sans mt-2">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
