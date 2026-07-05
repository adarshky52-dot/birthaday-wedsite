'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { getMediaUrl } from '../../services/api';
import { Heart, Volume2, Play, Pause, Disc, Calendar, Clock } from 'lucide-react';

export default function VoiceNotes() {
  const [playingId, setPlayingId] = useState(null);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState('0:00');
  const audioRef = useRef(null);

  // Fetch voice notes
  const { data: voiceNotes = [], isLoading } = useQuery({
    queryKey: ['voicenotes'],
    queryFn: async () => {
      const response = await api.get('/api/content/voicenotes');
      return response.data;
    }
  });

  const activeNote = voiceNotes.find(note => note._id === playingId);

  // Audio lifecycle sync
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        
        // Format time
        const curMins = Math.floor(audio.currentTime / 60);
        const curSecs = Math.floor(audio.currentTime % 60);
        setCurrentTime(`${curMins}:${String(curSecs).padStart(2, '0')}`);
      }
    };

    const handleEnded = () => {
      setPlayingId(null);
      setProgress(0);
      setCurrentTime('0:00');
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayToggle = (note) => {
    if (!audioRef.current) return;

    if (playingId === note._id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = getMediaUrl(note.audioUrl);
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setPlayingId(note._id);
        })
        .catch(err => console.error("Audio playback blocked:", err));
    }
  };

  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !activeNote) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = clickX / width;
    
    audioRef.current.currentTime = newPercentage * audioRef.current.duration;
    setProgress(newPercentage * 100);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-white mb-4">
          Voice Notes
        </h1>
        <p className="text-sm uppercase tracking-widest text-romantic-pink font-semibold">
          Whispered words, sweet messages, and letters spoken aloud just for you
        </p>
      </div>

      {/* Loading list */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : voiceNotes.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border-white/5">
          <Heart className="w-10 h-10 text-white/25 mx-auto mb-3" />
          <p className="text-white/50 font-serif italic text-sm">No voice notes uploaded yet. Open the Admin Panel to record/upload a voice message!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left panel: Floating Vinyl Player visualization */}
          <div className="md:col-span-1 glass-panel rounded-3xl p-6 border-white/5 text-center flex flex-col items-center gap-6 relative overflow-hidden shadow-[0_15px_35px_rgba(255,141,161,0.08)]">
            <h3 className="text-lg font-serif font-bold text-white mb-2">Currently Listening</h3>
            
            {/* Spinning Disc visual */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-md group-hover:blur-lg transition-all" />
              <Disc className={`w-40 h-40 text-rose-300 relative z-10 fill-rose-950/40 border-8 border-white/5 rounded-full ${
                playingId ? 'animate-spin' : ''
              }`} style={{ animationDuration: '6s' }} />
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-[#0c0517] border border-white/20 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Visualizer Wave Bar */}
            <div className="flex justify-center items-end gap-1 h-8 mt-2 w-full max-w-[200px]">
              {Array.from({ length: 15 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1 bg-gradient-to-t from-rose-500 to-purple-600 rounded-full transition-all duration-300 ${
                    playingId ? 'animate-[pulse_0.6s_infinite]' : 'h-1.5'
                  }`}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    height: playingId ? `${Math.floor(Math.random() * 24) + 6}px` : '6px'
                  }}
                />
              ))}
            </div>

            <div className="w-full">
              <p className="font-serif font-bold text-white text-base truncate">
                {activeNote ? activeNote.title : 'Select a sweet note'}
              </p>
              <p className="text-xs text-white/50 mt-1">
                {activeNote ? `Uploaded on ${activeNote.date}` : 'Tap Play to begin'}
              </p>
            </div>

            {/* Custom progress player controls */}
            {activeNote && (
              <div className="w-full flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-3xs text-white/50 px-1">
                  <span>{currentTime}</span>
                  <span>{activeNote.duration}</span>
                </div>
                
                {/* Progress bar line */}
                <div
                  onClick={handleProgressBarClick}
                  className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all relative"
                >
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-purple-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Playlist log items */}
          <div className="md:col-span-2 space-y-4">
            {voiceNotes.map((note) => {
              const isCurrent = playingId === note._id;

              return (
                <div
                  key={note._id}
                  onClick={() => handlePlayToggle(note)}
                  className={`glass-panel rounded-2xl p-5 border border-white/5 shadow-md flex items-center justify-between gap-4 cursor-pointer hover:border-rose-400/25 transition-all duration-300 ${
                    isCurrent ? 'bg-rose-500/10 border-rose-500/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    {/* Circle Play Indicator */}
                    <button
                      className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {isCurrent ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white pl-0.5" />}
                    </button>

                    <div>
                      <h4 className="font-serif font-bold text-lg text-white">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-4 text-2xs text-white/50 mt-1 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {note.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Volume visual decoration icon */}
                  {isCurrent && (
                    <Volume2 className="w-5 h-5 text-rose-300 animate-bounce" />
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
