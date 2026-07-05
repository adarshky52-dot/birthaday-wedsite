'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  // Playlist of romantic instrumental background music
  const playlist = [
    {
      title: "Romantic Piano Waltz",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Fallback royalty free
    },
    {
      title: "Sweet Memories Guitar",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    }
  ];

  useEffect(() => {
    // Instantiate Audio on mount in client side
    audioRef.current = new Audio(playlist[currentTrack].url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    // Track play state change
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audioRef.current.addEventListener('play', onPlay);
    audioRef.current.addEventListener('pause', onPause);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', onPlay);
        audioRef.current.removeEventListener('pause', onPause);
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Change source if track index changes
    const wasPlaying = isPlaying;
    audioRef.current.src = playlist[currentTrack].url;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(err => console.log("Audio play blocked by user gesture:", err));
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Audio play failed. User interaction might be required first.", err);
      });
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const setVolume = (volume) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  };

  return (
    <AudioContext.Provider value={{
      isPlaying,
      togglePlay,
      nextTrack,
      prevTrack,
      currentTrackName: playlist[currentTrack].title,
      setVolume
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useRomanticAudio = () => useContext(AudioContext);
