'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api, { getMediaUrl } from '../../services/api';
import {
  ShieldAlert, LayoutDashboard, Calendar, Camera, BookOpen, Volume2, Film, Heart, Plus, Trash2, Edit, Save, X, Upload, Gift, Music
} from 'lucide-react';

export default function AdminDashboard() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('stats');

  // Form toggle states
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Input States
  const [timelineForm, setTimelineForm] = useState({ title: '', description: '', date: '', category: 'Milestone', order: '0' });
  const [memoryForm, setMemoryForm] = useState({ title: '', caption: '', category: 'General', date: '' });
  const [letterForm, setLetterForm] = useState({ title: '', content: '', date: '', signature: 'Yours Forever ❤️' });
  const [photoForm, setPhotoForm] = useState({ title: '', description: '' });
  const [voiceForm, setVoiceForm] = useState({ title: '', duration: '2:15', date: '' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '' });
  const [songForm, setSongForm] = useState({ title: '', url: '' });
  
  const [surpriseForm, setSurpriseForm] = useState({
    giftBoxTitle: '',
    giftBoxDesc: '',
    step3Title: '',
    step3Message: '',
    step5Title: '',
    step5Message: '',
    step5Desc: ''
  });

  // Upload file inputs
  const [uploadFile, setUploadFile] = useState(null);
  
  // Custom surprise photo upload states
  const [surprisePhotoFile, setSurprisePhotoFile] = useState(null);
  const [surprisePhotoTitle, setSurprisePhotoTitle] = useState('');
  const [isUploadingSurprisePhoto, setIsUploadingSurprisePhoto] = useState(false);

  // Redirect to login if not logged in

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);

  // 1. Fetch Stats
  const { data: stats = {} } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/api/content/stats');
      return res.data;
    },
    enabled: !!admin
  });

  // 2. Fetch Lists depending on current tab
  const { data: listData = [], isLoading: isListLoading } = useQuery({
    queryKey: [activeTab],
    queryFn: async () => {
      let endpoint = '';
      if (activeTab === 'timeline') endpoint = '/api/content/timeline';
      else if (activeTab === 'memories') endpoint = '/api/content/memories';
      else if (activeTab === 'letters') endpoint = '/api/content/letters';
      else if (activeTab === 'photos') endpoint = '/api/content/photos';
      else if (activeTab === 'voicenotes') endpoint = '/api/content/voicenotes';
      else if (activeTab === 'videos') endpoint = '/api/content/videos';
      else if (activeTab === 'songs') endpoint = '/api/content/songs';

      if (!endpoint) return [];
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!admin && activeTab !== 'stats' && activeTab !== 'surprise'
  });

  // 2.5 Fetch surprise settings
  const { data: surpriseSettings, isLoading: isSurpriseLoading } = useQuery({
    queryKey: ['surprise-settings'],
    queryFn: async () => {
      const res = await api.get('/api/content/surprise-settings');
      return res.data;
    },
    enabled: !!admin && activeTab === 'surprise'
  });

  // Load surprise settings into form
  useEffect(() => {
    if (surpriseSettings) {
      setSurpriseForm({
        giftBoxTitle: surpriseSettings.giftBoxTitle || '',
        giftBoxDesc: surpriseSettings.giftBoxDesc || '',
        step3Title: surpriseSettings.step3Title || '',
        step3Message: surpriseSettings.step3Message || '',
        step5Title: surpriseSettings.step5Title || '',
        step5Message: surpriseSettings.step5Message || '',
        step5Desc: surpriseSettings.step5Desc || ''
      });
    }
  }, [surpriseSettings]);

  // Surprise mutation
  const updateSurpriseMutation = useMutation({
    mutationFn: async (updatedData) => {
      return api.put('/api/content/surprise-settings', updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surprise-settings'] });
      alert('Surprise settings updated successfully!');
    },
    onError: (err) => {
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSurpriseSubmit = (e) => {
    e.preventDefault();
    updateSurpriseMutation.mutate(surpriseForm);
  };

  // Fetch photos for surprise settings slideshow
  const { data: surprisePhotosList = [], isLoading: isSurprisePhotosLoading } = useQuery({
    queryKey: ['surprise-photos'],
    queryFn: async () => {
      const res = await api.get('/api/content/photos');
      return res.data;
    },
    enabled: !!admin && activeTab === 'surprise'
  });

  const handleUploadSurprisePhoto = async (e) => {
    e.preventDefault();
    if (!surprisePhotoFile) return alert('Please select a photo file first.');

    setIsUploadingSurprisePhoto(true);
    const formData = new FormData();
    formData.append('title', surprisePhotoTitle || 'Surprise Photo');
    formData.append('photos', surprisePhotoFile);

    try {
      await api.post('/api/content/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['surprise-photos'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setSurprisePhotoFile(null);
      setSurprisePhotoTitle('');
      alert('Photo added to surprise slideshow successfully!');
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploadingSurprisePhoto(false);
    }
  };

  const handleDeleteSurprisePhoto = async (id) => {
    if (!confirm('Are you sure you want to remove this photo from the surprise slideshow?')) return;
    try {
      await api.delete(`/api/content/photos/${id}`);
      queryClient.invalidateQueries({ queryKey: ['surprise-photos'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      alert('Photo removed successfully!');
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  // 3. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      let endpoint = '';
      if (type === 'timeline') endpoint = `/api/content/timeline/${id}`;
      else if (type === 'memories') endpoint = `/api/content/memories/${id}`;
      else if (type === 'letters') endpoint = `/api/content/letters/${id}`;
      else if (type === 'photos') endpoint = `/api/content/photos/${id}`;
      else if (type === 'voicenotes') endpoint = `/api/content/voicenotes/${id}`;
      else if (type === 'videos') endpoint = `/api/content/videos/${id}`;
      else if (type === 'songs') endpoint = `/api/content/songs/${id}`;

      return api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      alert('Item deleted successfully!');
    },
    onError: (err) => {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  });

  // 4. Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      let endpoint = '';
      if (activeTab === 'timeline') endpoint = '/api/content/timeline';
      else if (activeTab === 'memories') endpoint = '/api/content/memories';
      else if (activeTab === 'letters') endpoint = '/api/content/letters';
      else if (activeTab === 'photos') endpoint = '/api/content/photos';
      else if (activeTab === 'voicenotes') endpoint = '/api/content/voicenotes';
      else if (activeTab === 'videos') endpoint = '/api/content/videos';
      else if (activeTab === 'songs') endpoint = '/api/content/songs';

      return api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setShowAddForm(false);
      setUploadFile(null);
      // Reset forms
      setTimelineForm({ title: '', description: '', date: '', category: 'Milestone', order: '0' });
      setMemoryForm({ title: '', caption: '', category: 'General', date: '' });
      setLetterForm({ title: '', content: '', date: '', signature: 'Yours Forever ❤️' });
      setPhotoForm({ title: '', description: '' });
      setVoiceForm({ title: '', duration: '2:15', date: '' });
      setVideoForm({ title: '', description: '' });
      setSongForm({ title: '', url: '' });
      alert('Item added successfully!');
    },
    onError: (err) => {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (activeTab === 'timeline') {
      formData.append('title', timelineForm.title);
      formData.append('description', timelineForm.description);
      formData.append('date', timelineForm.date);
      formData.append('category', timelineForm.category);
      formData.append('order', timelineForm.order);
      if (uploadFile) formData.append('timeline', uploadFile);
    } else if (activeTab === 'memories') {
      formData.append('title', memoryForm.title);
      formData.append('caption', memoryForm.caption);
      formData.append('category', memoryForm.category);
      formData.append('date', memoryForm.date);
      if (uploadFile) formData.append('memories', uploadFile);
    } else if (activeTab === 'letters') {
      formData.append('title', letterForm.title);
      formData.append('content', letterForm.content);
      formData.append('date', letterForm.date);
      formData.append('signature', letterForm.signature);
      if (uploadFile) formData.append('letters', uploadFile);
    } else if (activeTab === 'photos') {
      formData.append('title', photoForm.title);
      formData.append('description', photoForm.description);
      if (uploadFile) formData.append('photos', uploadFile);
      else return alert('Please select a photo image to upload.');
    } else if (activeTab === 'voicenotes') {
      formData.append('title', voiceForm.title);
      formData.append('duration', voiceForm.duration);
      formData.append('date', voiceForm.date || new Date().toLocaleDateString());
      if (uploadFile) formData.append('audio', uploadFile);
      else return alert('Please select an audio file to upload.');
    } else if (activeTab === 'videos') {
      formData.append('title', videoForm.title);
      formData.append('description', videoForm.description);
      if (uploadFile) formData.append('videos', uploadFile);
      else return alert('Please select a video file to upload.');
    } else if (activeTab === 'songs') {
      formData.append('title', songForm.title);
      if (uploadFile) {
        formData.append('music', uploadFile);
      } else if (songForm.url) {
        formData.append('url', songForm.url);
      } else {
        return alert('Please upload a music file OR enter a direct song URL.');
      }
    }

    createMutation.mutate(formData);
  };

  if (loading || !admin) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-4">
      {/* Sidebar Nav Tabs */}
      <div className="md:col-span-1 glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-2 h-fit">
        <div className="flex items-center gap-2 mb-4 px-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span className="font-serif font-bold text-white text-lg">Dashboard</span>
        </div>

        {[
          { id: 'stats', label: 'Overview', icon: LayoutDashboard },
          { id: 'timeline', label: 'Timeline Logs', icon: Calendar },
          { id: 'memories', label: 'Memories', icon: Heart },
          { id: 'letters', label: 'Love Letters', icon: BookOpen },
          { id: 'photos', label: 'Photos Montage', icon: Camera },
          { id: 'voicenotes', label: 'Voice Notes', icon: Volume2 },
          { id: 'videos', label: 'Videos', icon: Film },
          { id: 'songs', label: 'Background Music', icon: Music },
          { id: 'surprise', label: 'Surprise Settings', icon: Gift }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowAddForm(false);
                setUploadFile(null);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content Area */}
      <div className="md:col-span-3 flex flex-col gap-6">
        
        {/* TAB 1: OVERVIEW STATS CARD */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-serif font-bold text-white">Summary Statistics</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { title: 'Timeline Events', count: stats.totalTimeline || 0, icon: Calendar, color: 'text-sky-300 bg-sky-500/10' },
                { title: 'Memories logged', count: stats.totalMemories || 0, icon: Heart, color: 'text-rose-300 bg-rose-500/10' },
                { title: 'Love Letters', count: stats.totalLetters || 0, icon: BookOpen, color: 'text-emerald-300 bg-emerald-500/10' },
                { title: 'Voice Recordings', count: stats.totalVoiceNotes || 0, icon: Volume2, color: 'text-purple-300 bg-purple-500/10' },
                { title: 'Memory Videos', count: stats.totalVideos || 0, icon: Film, color: 'text-pink-300 bg-pink-500/10' },
                { title: 'Background Songs', count: stats.totalSongs || 0, icon: Music, color: 'text-amber-300 bg-amber-500/10' }
              ].map((s, idx) => (
                <div key={idx} className="glass-panel rounded-2xl p-5 border-white/5 flex flex-col gap-2 relative overflow-hidden text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-serif font-black text-white mt-2">{s.count}</span>
                  <span className="text-xs text-white/50 font-bold uppercase tracking-wider">{s.title}</span>
                </div>
              ))}
            </div>

            {/* Quick manual hints */}
            <div className="glass-panel rounded-2xl p-6 border-white/5 text-left text-sm text-white/70 leading-relaxed">
              <h3 className="font-bold text-white mb-2">Seeding details</h3>
              <p>Everything you upload here is stored locally inside the backend server uploads directory and indexed securely inside the MongoDB cluster. The main website dynamically fetches these routes asynchronously to reflect updates instantly.</p>
            </div>
          </div>
        )}

        {/* LISTINGS & CREATIONS CRUD SECTIONS */}
        {activeTab !== 'stats' && activeTab !== 'surprise' && (
          <div className="flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif font-bold text-white capitalize">{activeTab} List</h2>
              
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs tracking-wide uppercase flex items-center gap-1.5 shadow-md"
              >
                {showAddForm ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Add</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </>
                )}
              </button>
            </div>

            {/* Form Drawer Section */}
            {showAddForm && (
              <form onSubmit={handleCreateSubmit} className="glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-4 shadow-xl">
                <h3 className="font-serif font-bold text-lg text-white border-b border-white/5 pb-2 mb-2">Create New Entry</h3>
                
                {/* 1. Timeline Form */}
                {activeTab === 'timeline' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                      <input
                        type="text"
                        required
                        value={timelineForm.title}
                        onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Date (e.g. October 2022)</label>
                      <input
                        type="text"
                        required
                        value={timelineForm.date}
                        onChange={(e) => setTimelineForm({ ...timelineForm, date: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Category</label>
                      <select
                        value={timelineForm.category}
                        onChange={(e) => setTimelineForm({ ...timelineForm, category: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      >
                        <option value="Meeting">Meeting</option>
                        <option value="Trip">Trip</option>
                        <option value="Gift">Gift</option>
                        <option value="Milestone">Milestone</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Sort Order</label>
                      <input
                        type="number"
                        value={timelineForm.order}
                        onChange={(e) => setTimelineForm({ ...timelineForm, order: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Description</label>
                      <textarea
                        required
                        rows="3"
                        value={timelineForm.description}
                        onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Memories Form */}
                {activeTab === 'memories' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                      <input
                        type="text"
                        required
                        value={memoryForm.title}
                        onChange={(e) => setMemoryForm({ ...memoryForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Date</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g., Summer 2023"
                        value={memoryForm.date}
                        onChange={(e) => setMemoryForm({ ...memoryForm, date: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-3xs uppercase font-bold text-white/50">Category</label>
                      <input
                        type="text"
                        value={memoryForm.category}
                        onChange={(e) => setMemoryForm({ ...memoryForm, category: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Caption</label>
                      <textarea
                        required
                        rows="3"
                        value={memoryForm.caption}
                        onChange={(e) => setMemoryForm({ ...memoryForm, caption: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Letters Form */}
                {activeTab === 'letters' && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                        <input
                          type="text"
                          required
                          value={letterForm.title}
                          onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-3xs uppercase font-bold text-white/50">Date</label>
                        <input
                          type="text"
                          required
                          value={letterForm.date}
                          onChange={(e) => setLetterForm({ ...letterForm, date: e.target.value })}
                          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Content</label>
                      <textarea
                        required
                        rows="6"
                        value={letterForm.content}
                        onChange={(e) => setLetterForm({ ...letterForm, content: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 leading-relaxed"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Signature</label>
                      <input
                        type="text"
                        value={letterForm.signature}
                        onChange={(e) => setLetterForm({ ...letterForm, signature: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Photos Form */}
                {activeTab === 'photos' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                      <input
                        type="text"
                        value={photoForm.title}
                        onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Description</label>
                      <input
                        type="text"
                        value={photoForm.description}
                        onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Voice Form */}
                {activeTab === 'voicenotes' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                      <input
                        type="text"
                        required
                        value={voiceForm.title}
                        onChange={(e) => setVoiceForm({ ...voiceForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Duration (e.g. 1:45)</label>
                      <input
                        type="text"
                        required
                        value={voiceForm.duration}
                        onChange={(e) => setVoiceForm({ ...voiceForm, duration: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-3xs uppercase font-bold text-white/50">Date (Leave blank for today)</label>
                      <input
                        type="text"
                        value={voiceForm.date}
                        onChange={(e) => setVoiceForm({ ...voiceForm, date: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Videos Form */}
                {activeTab === 'videos' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Title</label>
                      <input
                        type="text"
                        required
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Description</label>
                      <input
                        type="text"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>
                )}

                {/* 7. Songs Form */}
                {activeTab === 'songs' && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">Song Title</label>
                      <input
                        type="text"
                        required
                        value={songForm.title}
                        onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                        placeholder="e.g. Instrumental Romantic Theme"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-3xs uppercase font-bold text-white/50">External Song URL (Optional, if uploading file below)</label>
                      <input
                        type="url"
                        value={songForm.url}
                        onChange={(e) => setSongForm({ ...songForm, url: e.target.value })}
                        className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                        placeholder="e.g. https://example.com/romantic-melody.mp3"
                      />
                    </div>
                  </div>
                )}

                {/* General File Upload Input for form entries */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-3xs uppercase font-bold text-white/50">File Attachment</label>
                  <div className="relative border-2 border-dashed border-white/10 hover:border-rose-400/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/2 hover:bg-white/5 transition-all">
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-white/35" />
                    <span className="text-xs text-white/60">
                      {uploadFile ? uploadFile.name : 'Click or drop file to attach'}
                    </span>
                  </div>
                </div>

                {/* Form Action Submit */}
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full mt-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs tracking-wider uppercase text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Uploading...' : 'Submit Entry'}
                </button>
              </form>
            )}

            {/* List entries renderer */}
            {isListLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
              </div>
            ) : listData.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-2xl border-white/5">
                <p className="text-white/40 font-serif italic text-xs">No entries listed in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listData.map((item) => (
                  <div key={item._id} className="glass-panel rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                      {/* Left visual icon or media thumbnail representation */}
                      {item.imageUrl && (
                        <img
                          src={getMediaUrl(item.imageUrl)}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                      )}
                      {item.coverImageUrl && (
                        <img
                          src={getMediaUrl(item.coverImageUrl)}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                      )}
                      {!item.imageUrl && !item.coverImageUrl && activeTab === 'songs' && (
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                          <Music className="w-5 h-5 text-amber-300" />
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-white truncate text-sm">
                          {item.title}
                        </h4>
                        <p className="text-3xs text-white/50 uppercase mt-0.5 font-semibold truncate">
                          {activeTab === 'songs' ? (item.url && !item.url.startsWith('/') ? 'External Link' : 'Local File Upload') : (item.date || item.category || 'Logged item')}
                        </p>
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                          deleteMutation.mutate({ id: item._id, type: activeTab });
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-300 transition-colors shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SURPRISE SETTINGS EDITOR */}
        {activeTab === 'surprise' && (
          <div className="flex flex-col gap-6 text-left animate-fadeIn">
            <h2 className="text-3xl font-serif font-bold text-white">Surprise Page Settings</h2>
            
            {isSurpriseLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSurpriseSubmit} className="glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-6 shadow-xl">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-serif font-bold text-lg text-white">1. Gift Box Screen (Step 1)</h3>
                  <p className="text-2xs text-white/50">Configure the opening splash screen text.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Gift Box Title</label>
                    <input
                      type="text"
                      required
                      value={surpriseForm.giftBoxTitle}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, giftBoxTitle: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Gift Box Subtitle / Description</label>
                    <input
                      type="text"
                      required
                      value={surpriseForm.giftBoxDesc}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, giftBoxDesc: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                </div>

                <div className="border-b border-white/5 pb-3 mt-2">
                  <h3 className="font-serif font-bold text-lg text-white">2. Card Greeting Screen (Step 3)</h3>
                  <p className="text-2xs text-white/50">Configure the message shown right after opening the box.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Greeting Title</label>
                    <input
                      type="text"
                      required
                      value={surpriseForm.step3Title}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, step3Title: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Greeting Message</label>
                    <textarea
                      required
                      rows="4"
                      value={surpriseForm.step3Message}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, step3Message: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 leading-relaxed text-white"
                    />
                  </div>
                </div>

                <div className="border-b border-white/5 pb-3 mt-2">
                  <h3 className="font-serif font-bold text-lg text-white">3. Final Screen & Fireworks (Step 5)</h3>
                  <p className="text-2xs text-white/50">Configure the closing screens and signature message.</p>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Final Title</label>
                    <input
                      type="text"
                      required
                      value={surpriseForm.step5Title}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, step5Title: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Final Love Letter quote</label>
                    <input
                      type="text"
                      required
                      value={surpriseForm.step5Message}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, step5Message: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Final Bottom Subtext</label>
                    <textarea
                      required
                      rows="3"
                      value={surpriseForm.step5Desc}
                      onChange={(e) => setSurpriseForm({ ...surpriseForm, step5Desc: e.target.value })}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 leading-relaxed text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateSurpriseMutation.isPending}
                  className="w-full mt-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs tracking-wider uppercase text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {updateSurpriseMutation.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}

            {/* 4. Slideshow Photos Section */}
            <div className="glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-6 shadow-xl mt-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-serif font-bold text-lg text-white">4. Slideshow Photos (Step 4)</h3>
                <p className="text-2xs text-white/50">Manage the photos displayed in the surprise montage slideshow.</p>
              </div>

              {/* Thumbnails grid */}
              {isSurprisePhotosLoading ? (
                <div className="flex justify-center py-5">
                  <div className="w-6 h-6 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
              ) : surprisePhotosList.length === 0 ? (
                <p className="text-xs text-white/40 italic">No custom slideshow photos uploaded yet. Fallback photos will be shown.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {surprisePhotosList.map((photo) => (
                    <div key={photo._id} className="relative group rounded-xl overflow-hidden aspect-square border border-white/10 bg-white/5 shadow-md">
                      <img
                        src={getMediaUrl(photo.imageUrl)}
                        alt={photo.title}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 gap-1.5 text-center">
                        <span className="text-3xs text-white font-bold truncate max-w-full px-1">{photo.title}</span>
                        <button
                          onClick={() => handleDeleteSurprisePhoto(photo._id)}
                          className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload form */}
              <form onSubmit={handleUploadSurprisePhoto} className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <h4 className="font-serif font-bold text-sm text-white">Add Photo to Slideshow</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-3xs uppercase font-bold text-white/50">Photo Title / Caption</label>
                    <input
                      type="text"
                      placeholder="E.g., Walking together"
                      value={surprisePhotoTitle}
                      onChange={(e) => setSurprisePhotoTitle(e.target.value)}
                      className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-white"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs uppercase font-bold text-white/50">Photo File</label>
                    <div className="relative border border-dashed border-white/10 hover:border-rose-400/40 rounded-xl px-3 py-2 flex items-center justify-between gap-1.5 cursor-pointer bg-white/2 hover:bg-white/5 transition-all text-xs">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSurprisePhotoFile(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-white/60 truncate">
                        {surprisePhotoFile ? surprisePhotoFile.name : 'Select image...'}
                      </span>
                      <Upload className="w-4 h-4 text-white/35 shrink-0" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploadingSurprisePhoto}
                  className="py-2 px-4 rounded-full bg-rose-600 hover:bg-rose-500 font-semibold text-xs tracking-wider uppercase text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 self-start"
                >
                  {isUploadingSurprisePhoto ? 'Uploading...' : 'Upload & Add to Slideshow'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
