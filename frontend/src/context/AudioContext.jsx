'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api, { getMediaUrl } from '../services/api';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(null);

  // Playlist of romantic instrumental background music (initially with fallbacks)
  const [playlist, setPlaylist] = useState([
    {
      title: "Romantic Piano Waltz",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Fallback royalty free
    },
    {
      title: "Sweet Memories Guitar",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    }
  ]);

  // Fetch playlist from server
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await api.get('/api/content/songs');
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map(song => ({
            title: song.title,
            url: getMediaUrl(song.url)
          }));
          setPlaylist(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch custom background songs playlist:", err);
      }
    };
    fetchPlaylist();
  }, []);

  useEffect(() => {
    // Instantiate Audio on mount in client side using the initial first song
    if (!audioRef.current && playlist.length > 0) {
      audioRef.current = new Audio(playlist[0].url);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;

      // Track play state change
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      audioRef.current.addEventListener('play', onPlay);
      audioRef.current.addEventListener('pause', onPause);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [playlist]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playlist.length === 0 || !playlist[currentTrack]) return;
    
    // Change source if track index or playlist contents change
    const wasPlaying = isPlaying;
    audioRef.current.src = playlist[currentTrack].url;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(err => console.log("Audio play blocked by user gesture:", err));
    }
  }, [currentTrack, playlist]);

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
