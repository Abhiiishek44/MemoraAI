import React from 'react';
import { Bell, Search } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md">
      <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500">
        <Search className="h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search topics, flashcards, quizzes..." 
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
