import axios from 'axios';

// Static mock database for complete offline APK / serverless fallback
const mockFallbacks = {
  '/api/content/timeline': [
    { _id: 't1', date: 'March 18, 2023', category: 'Meeting', title: 'The Day We Met', description: 'Under the warm city lights, our eyes met for the first time. That single moment changed the course of my life forever.' },
    { _id: 't2', date: 'December 24, 2023', category: 'Milestone', title: 'First Holiday Together', description: 'Celebrating our first Christmas together, sharing warm hot chocolate and planning our future.' },
    { _id: 't3', date: 'June 18, 2024', category: 'Trip', title: 'Our Roadtrip to the Hills', description: 'Driving through winding roads, singing along to our favorite songs with the cool wind in our hair.' },
    { _id: 't4', date: 'March 18, 2024', category: 'Gift', title: 'First Anniversary Surprise', description: 'A handwritten box of letters and a custom photo book. Seeing your teary eyes made my entire year.' }
  ],
  '/api/content/letters': [
    { _id: 'l1', title: 'A Promise to You', date: 'December 2023', content: 'My dear, as I write this, I am reminded of how lucky I am to have you. I promise to stand by you in all seasons, to celebrate your joys, and comfort you in your storms. You are my home.' },
    { _id: 'l2', title: 'Why I Love You', date: 'February 2024', content: 'I love you not only for who you are, but for who I am when I am with you. I love the sound of your laughter, the warmth of your hand in mine, and the beautiful future we are building together.' },
    { _id: 'l3', title: 'Happy Birthday, My Heart', date: 'June 2026', content: 'Today is about celebrating the most beautiful person in the world. Thank you for bringing endless sunshine into my life. Happy Birthday, my queen. Here is to a lifetime of birthdays together!' }
  ],
  '/api/content/memories': [
    { _id: 'm1', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', title: 'Holding Hands in Paris', caption: 'Two souls, sharing a single heartbeat under the autumn breeze.', date: 'October 12, 2023', category: 'Travel' },
    { _id: 'm2', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop', title: 'A Special Birthday Wish', caption: 'Every rose speaks of the promises and beautiful memories we share.', date: 'December 04, 2023', category: 'Celebration' },
    { _id: 'm3', imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', title: 'Doodles of Our Future', caption: 'Simple drawings that represent infinite emotions and plans.', date: 'February 14, 2024', category: 'Milestone' },
    { _id: 'm4', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop', title: 'Anniversary Balloons', caption: 'Celebrating another year of laughter, growth, and endless love.', date: 'June 20, 2024', category: 'Celebration' },
    { _id: 'm5', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop', title: 'Hiking the Peaks Together', caption: 'Conquering heights, standing hand-in-hand above the clouds.', date: 'August 18, 2024', category: 'Travel' },
    { _id: 'm6', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop', title: 'Your Radiant Smile', caption: 'Your happy smile captured in the golden hour is my favorite memory.', date: 'November 11, 2024', category: 'General' },
    { _id: 'm7', imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop', title: 'Sunset Beach Picnic', caption: 'Watching the soft waves, sharing cozy talks and warm hot chocolate.', date: 'January 05, 2025', category: 'Dates' }
  ],
  '/api/content/voicenotes': [
    { _id: 'v1', title: 'Late Night Talk', date: 'January 10, 2024', audioUrl: '', duration: '0:15', note: 'A voice memo of us laughing uncontrollably at a silly joke at 2 AM.' },
    { _id: 'v2', title: 'Sleepy Midnight Wish', date: 'October 15, 2024', audioUrl: '', duration: '0:45', note: 'Your sweet sleepy voice wishing me happy birthday at midnight.' }
  ],
  '/api/content/videos': [
    { _id: 'vd1', title: 'Anniversary Cake Cutting', date: 'October 15, 2023', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-hands-of-a-couple-close-up-39744-large.mp4', description: 'Holding hands, making a wish, and blowing out the candles together.' },
    { _id: 'vd2', title: 'Sunset Walks by the Ocean', date: 'August 05, 2024', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-couple-walking-on-the-beach-at-sunset-1525-large.mp4', description: 'A small video snippet of the orange waves and our silhouettes walking by the shore.' }
  ],
  '/api/content/photos': [
    { _id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', category: 'Dates' },
    { _id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop', category: 'Travel' }
  ],
  '/api/content/stats': {
    totalMemories: 7,
    totalLetters: 3,
    totalVoiceNotes: 2,
    totalVideos: 2
  },
  '/api/content/surprise-settings': {
    giftBoxTitle: "A Surprise For You 🎁",
    giftBoxDesc: "Tap the box below to open your birthday surprise",
    step3Title: "To My Favorite Human",
    step3Message: "Today is the day the world was blessed with your laugh, your kind heart, and your beautiful soul. I am so incredibly lucky to walk by your side.",
    step5Title: "Eternal Love",
    step5Message: "You are the most beautiful chapter of my life. Happy Birthday, My Love ❤️",
    step5Desc: "May your birthday be filled with the same infinite joy and warmth that you bring to my life every single day."
  }
};

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  if (baseURL) {
    const cleanBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const cleanUrl = url.startsWith('/') ? url : '/' + url;
    return `${cleanBase}${cleanUrl}`;
  }
  return url;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});

// Automatically inject JWT adminToken if present
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept errors (like network offline / file:// origin blocked) and return fallback data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let url = error.config?.url || '';
    
    // Normalize WebView asset urls (absolute paths loaded inside custom webview assets domain)
    const hostPrefix = 'https://appassets.androidplatform.net';
    if (url.startsWith(hostPrefix)) {
      url = url.substring(hostPrefix.length);
    }
    
    // Normalize absolute api urls by stripping the configured baseURL
    const apiBase = error.config?.baseURL || '';
    if (apiBase && url.startsWith(apiBase)) {
      url = url.substring(apiBase.length);
    }
    
    // Ensure the mapped url starts with a slash
    if (url && !url.startsWith('/')) {
      url = '/' + url;
    }
    
    if (url && mockFallbacks[url]) {
      console.warn(`API server offline. Serving mock fallback for: ${url}`);
      return Promise.resolve({
        data: mockFallbacks[url],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default api;
