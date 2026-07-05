'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { AudioProvider } from '../context/AudioContext';
import Navbar from './Navbar';
import Galaxy from './Galaxy';
import SplashCursor from './SplashCursor';

// Create TanStack Query client
const queryClient = new QueryClient();

// Map routes to dynamic fluid splash colors
const getSectionColor = (pathname) => {
  switch (pathname) {
    case '/':
      return '#ff8da1'; // Rose Pink
    case '/timeline':
      return '#ffcba4'; // Warm Peach/Orange
    case '/memories':
      return '#e05c75'; // Rose Gold/Baby Pink
    case '/letters':
      return '#ffffff'; // Soft White
    case '/surprise':
      return '#e6c687'; // Celebration Gold
    case '/voice':
      return '#d6b5ff'; // Lavender
    case '/videos':
      return '#ff8da1'; // Sunset Magenta
    default:
      return '#ff8da1'; // Default
  }
};

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [cursorColor, setCursorColor] = useState('#ff8da1');
  const [galaxyConfig, setGalaxyConfig] = useState({
    starSpeed: 0.5,
    rotationSpeed: 0.3,
    density: 1.2,
    hueShift: 340,
    speed: 1.0,
    saturation: 1.5
  });

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync cursor color with current route path
  useEffect(() => {
    setCursorColor(getSectionColor(pathname));
  }, [pathname]);

  // Sync WebGL background configuration dynamically as sections enter view
  useEffect(() => {
    const handleSectionChange = (e) => {
      const { sectionId } = e.detail;
      let newConfig = {
        starSpeed: 0.5,
        rotationSpeed: 0.3,
        density: 1.2,
        hueShift: 340,
        speed: 1.0,
        saturation: 1.5
      };

      switch (sectionId) {
        case 'home':
          newConfig = { starSpeed: 0.5, rotationSpeed: 0.3, density: 1.2, hueShift: 340, speed: 1.0, saturation: 1.5 };
          break;
        case 'timeline':
          newConfig = { starSpeed: 0.8, rotationSpeed: 0.5, density: 1.5, hueShift: 30, speed: 1.3, saturation: 1.8 };
          break;
        case 'memories':
          newConfig = { starSpeed: 0.3, rotationSpeed: 0.15, density: 1.0, hueShift: 140, speed: 0.6, saturation: 1.4 };
          break;
        case 'letters':
          newConfig = { starSpeed: 0.25, rotationSpeed: 0.1, density: 0.8, hueShift: 220, speed: 0.5, saturation: 1.2 };
          break;
        case 'voice':
          newConfig = { starSpeed: 0.6, rotationSpeed: 0.4, density: 1.4, hueShift: 275, speed: 1.1, saturation: 1.6 };
          break;
        case 'videos':
          newConfig = { starSpeed: 0.7, rotationSpeed: 0.45, density: 1.1, hueShift: 360, speed: 1.2, saturation: 1.7 };
          break;
        case 'surprise':
          newConfig = { starSpeed: 1.6, rotationSpeed: 1.1, density: 2.2, hueShift: 90, speed: 2.5, saturation: 2.0 };
          break;
        default:
          break;
      }
      setGalaxyConfig(newConfig);
    };

    window.addEventListener('galaxy-section-change', handleSectionChange);
    return () => window.removeEventListener('galaxy-section-change', handleSectionChange);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#fffcf5]" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioProvider>
          {/* WebGL Galaxy Starfield Background with pastel saturated stars */}
          <Galaxy 
            starSpeed={galaxyConfig.starSpeed} 
            rotationSpeed={galaxyConfig.rotationSpeed} 
            density={galaxyConfig.density} 
            hueShift={galaxyConfig.hueShift}
            speed={galaxyConfig.speed}
            glowIntensity={1.2} 
            saturation={galaxyConfig.saturation}
            uTransparent={true}
          />

          {/* WebGL Fluid splash cursor */}
          <SplashCursor 
            COLOR={cursorColor} 
            RAINBOW_MODE={false}
            SPLAT_RADIUS={0.25}
            DENSITY_DISSIPATION={2.5}
            VELOCITY_DISSIPATION={1.8}
          />

          {/* Floating glass Navbar */}
          <Navbar />

          {/* Animated Background Auroras */}
          <div className="aurora-glow aurora-pink"></div>
          <div className="aurora-glow aurora-lavender"></div>

          {/* Main Content Pages */}
          <main className="min-h-screen pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto z-10 relative">
            {children}
          </main>
        </AudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
