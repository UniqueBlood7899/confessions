//app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Home, FileText } from 'lucide-react';

// Define the post type interface
interface Confession {
  _id: string;
  content: string;
  createdAt?: string;
  likes?: number;
  username?: string;
}

const Dashboard = () => {
  const [newConfession, setNewConfession] = useState('');
  // Fix: explicitly type the state to match the interface
  const [posts, setPosts] = useState<Confession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confessionCharCount, setConfessionCharCount] = useState(0);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      const response = await fetch('/api/confessions');
      const data = await response.json();
      console.log('Fetched confessions:', data);
      if (Array.isArray(data)) {
        // Fix: type assertion to tell TypeScript this data matches our interface
        setPosts(data as Confession[]);
      } else {
        console.error('Fetched data is not an array:', data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
      setPosts([]);
    }
  };

  const handlePost = async () => {
    if (newConfession.trim() !== '') {
      try {
        const response = await fetch('/api/confessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newConfession.trim() }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to post confession');
        }
  
        const data = await response.json();
        console.log('Posted confession:', data);
  
        setPosts([data as Confession, ...posts]);
        setNewConfession('');
        setConfessionCharCount(0);
      } catch (error) {
        console.error('Error posting confession:', error);
      }
    } else {
      console.log('Cannot post empty confession');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleConfessionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 2000) {
      setNewConfession(text);
      setConfessionCharCount(text.length);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (post && typeof post.content === 'string') {
      return post.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    console.warn('Invalid post object:', post);
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <header className="py-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            <Home className="mr-2" />
            <h1 className="text-2xl font-bold">CONFESSIONS</h1>
          </div>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search Posts"
                className="px-3 py-2 pl-10 pr-4 rounded-full bg-gray-800 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={handleSearch}
              />
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </header>

        <main className="mt-6">
          <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3">
                <FileText size={20} />
              </div>
              <div className="flex-grow">
                <p className="text-lg font-semibold mb-1">Create a New Confession</p>
                <textarea
                  placeholder="Write New Confession..."
                  className="w-full p-2 rounded border bg-gray-700 text-white placeholder-gray-400"
                  value={newConfession}
                  onChange={handleConfessionChange}
                  maxLength={2000}
                />
                <p className="text-sm text-gray-400 mt-1">{confessionCharCount}/2000 characters</p>
              </div>
            </div>
            <div className="flex justify-end items-center">
              <button 
                onClick={handlePost}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Post
              </button>
            </div>
          </div>

          <div className="text-center text-gray-400 mb-6">
            {filteredPosts.length} Confessions
          </div>

          {filteredPosts.map((post) => (
            <div key={post._id} className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
              <p className="mb-4">{post.content}</p>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;