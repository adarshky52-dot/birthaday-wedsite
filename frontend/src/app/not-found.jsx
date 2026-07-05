'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <Heart className="w-16 h-16 text-rose-500 fill-rose-500/20 animate-pulse mb-6" />
      <h1 className="text-4xl font-serif font-black text-white mb-2">Page Lost In Translation</h1>
      <p className="text-sm text-white/50 mb-8 max-w-sm">
        It seems this path doesn't lead to a chapter of our story. Let's head back home.
      </p>
      <Link href="/" className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md">
        Go Back Home
      </Link>
    </div>
  );
}
