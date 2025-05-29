"use client";

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

// Define the confession interface
interface Confession {
  _id: string;
  content: string;
  createdAt?: string;
}

const HomePage = () => {
  const [newConfession, setNewConfession] = useState('');
  // Fix: explicitly type the state to match the interface
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confessionCharCount, setConfessionCharCount] = useState(0);

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      const response = await fetch('/api/confessions');
      const data = await response.json();
      if (Array.isArray(data)) {
        setConfessions(data as Confession[]);
      } else {
        console.error('Fetched data is not an array:', data);
        setConfessions([]);
      }
    } catch (error) {
      console.error('Error fetching confessions:', error);
      setConfessions([]);
    }
  };

  const handlePost = async () => {
    if (newConfession.trim() !== '') {
      try {
        const response = await fetch('/api/confessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: newConfession.trim()
            // Removed username field
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to post confession');
        }
  
        const data = await response.json();
        setConfessions([data as Confession, ...confessions]);
        setNewConfession('');
        setConfessionCharCount(0);
      } catch (error) {
        console.error('Error posting confession:', error);
      }
    }
  };

  const handleConfessionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 2000) {
      setNewConfession(text);
      setConfessionCharCount(text.length);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredConfessions = confessions.filter(confession => {
    if (confession && typeof confession.content === 'string') {
      return confession.content.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <header className="py-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">CONFESSIONS</h1>
          </div>
          <div className="flex items-center">
            <div className="relative">
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
            <div className="flex justify-between items-center">
              <button 
                onClick={handlePost}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Post
              </button>
            </div>
          </div>

          <div className="text-center text-gray-400 mb-6">
            {filteredConfessions.length} Confessions
          </div>

          <div className="space-y-4">
            {filteredConfessions.map((confession) => (
              <div key={confession._id} className="bg-gray-800 p-4 rounded-lg">
                <p>{confession.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400 text-sm">
                    {confession.createdAt && new Date(confession.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;