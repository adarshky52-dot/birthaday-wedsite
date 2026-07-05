'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getMediaUrl } from '../../services/api';
import { Calendar, MapPin, Heart, Gift, Sparkles, MessageCircleHeart } from 'lucide-react';
import Tilt from '../../components/Tilt';


const categoryIcons = {
  Meeting: MessageCircleHeart,
  Trip: MapPin,
  Gift: Gift,
  Milestone: Sparkles,
  General: Heart
};

export default function Timeline() {
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch timeline data from API
  const { data: timelineData = [], isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const response = await api.get('/api/content/timeline');
      return response.data;
    }
  });

  // Extract categories for filtering
  const categories = ['All', ...new Set(timelineData.map(item => item.category || 'General'))];

  // Filter items
  const filteredTimeline = activeFilter === 'All'
    ? timelineData
    : timelineData.filter(item => item.category === activeFilter);

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-4">
          Our Love Story Timeline
        </h1>
        <p className="text-sm uppercase tracking-widest text-romantic-pink font-semibold">
          Every step, every memory, every milestone we shared together
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                activeFilter === category
                  ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.2)] border border-rose-600/10'
                  : 'bg-white border border-rose-100 text-rose-950/60 hover:text-rose-950 hover:bg-rose-50/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredTimeline.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl p-8 border-rose-100/10">
          <Heart className="w-12 h-12 text-rose-950/20 mx-auto mb-4" />
          <p className="text-rose-950/60 font-serif italic">No timeline entries yet. Visit the Admin Panel to write down our first memory!</p>
        </div>
      ) : (
        /* The Timeline Container */
        <div className="relative border-l-2 border-rose-500/30 ml-4 md:mx-auto md:w-full md:border-l-0">
          
          {/* Vertical line helper for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-rose-500/30 transform -translate-x-1/2 pointer-events-none" />

          <div className="space-y-12 relative">
            <AnimatePresence mode="popLayout">
              {filteredTimeline.map((item, index) => {
                const isEven = index % 2 === 0;
                const IconComponent = categoryIcons[item.category] || categoryIcons.General;

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6 }}
                    className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center w-full"
                  >
                    
                    {/* Timeline Node Point indicator */}
                    <div className="absolute -left-[27px] md:left-1/2 md:-translate-x-1/2 z-20 w-8 h-8 rounded-full bg-white border-2 border-rose-400 flex items-center justify-center shadow-[0_2px_10px_rgba(251,113,133,0.3)]">
                      <IconComponent className="w-4 h-4 text-rose-500" />
                    </div>

                    {/* Timeline Left Panel Card */}
                    <div className={`w-full md:w-[45%] pl-6 md:pl-0 ${isEven ? 'md:order-1' : 'md:order-2 md:text-right'}`}>
                      {/* Empty side helper placeholder */}
                    </div>

                    {/* Timeline Right Panel Card */}
                    <div className={`w-full md:w-[45%] pl-6 md:pl-0 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                      <Tilt className="rounded-3xl shadow-xl">
                        <div className="glass-panel glass-card-glow rounded-3xl p-6 border-white/5 flex flex-col gap-4 text-left">
                          {/* Timeline Date & Category Tag */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </div>
                            <span className="text-2xs uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold border border-rose-200">
                              {item.category || 'General'}
                            </span>
                          </div>

                          {/* Image inside card if uploaded */}
                          {item.imageUrl && (
                            <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group">
                              <img
                                src={getMediaUrl(item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}

                          <div>
                            <h3 className="text-xl font-serif font-bold text-white mb-2">
                              {item.title}
                            </h3>
                            <p className="text-sm text-white/70 leading-relaxed font-sans">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Tilt>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
