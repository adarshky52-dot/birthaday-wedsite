'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function Tilt({ children, max = 12, perspective = 1000, scale = 1.02, className = '', ...props }) {
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // Detect mobile/touch devices to disable intensive 3D hover transforms
    const checkTouch = () => {
      setIsTouchDevice(
        window.matchMedia('(pointer: coarse)').matches || 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0
      );
    };
    checkTouch();
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Rotation calculations (X rotation depends on Y offset, Y rotation depends on X offset)
    const tiltX = -y * max;
    const tiltY = x * max;

    // Specular reflection glare angle based on mouse direction relative to center
    const angle = Math.atan2(e.clientY - (rect.top + height / 2), e.clientX - (rect.left + width / 2)) * (180 / Math.PI);

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
    });

    setGlareStyle({
      opacity: 0.18,
      background: `linear-gradient(${angle}deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 70%)`,
      transition: 'opacity 0.1s ease'
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.5s ease'
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={tiltStyle}
      {...props}
    >
      {/* Glare overlay element */}
      {!isTouchDevice && (
        <div 
          className="absolute inset-0 pointer-events-none z-30" 
          style={glareStyle}
        />
      )}
      {children}
    </div>
  );
}
