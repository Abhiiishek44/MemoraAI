import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BookOpen,
  Layers, 
  Library, 
  Target, 
  PieChart, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: UploadCloud, label: 'Upload Study Material', path: '/upload' },
  { icon: BookOpen, label: 'Topics', path: '/topics' },
  { icon: Layers, label: 'Flashcards Review', path: '/flashcards' },
  { icon: Library, label: 'MCQ Tests', path: '/tests' },
  { icon: Target, label: 'Weak Areas', path: '/weak-areas' },
  { icon: PieChart, label: 'Progress', path: '/progress' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 flex h-screen w-64 flex-col border-r border-gray-100 bg-white px-4 py-6 shadow-sm">
      <div className="mb-8 flex items-center justify-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
          R
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">RecallAI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
        
        <div className="mt-8 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Preferences
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </nav>

      <div className="mt-auto border-t border-gray-100 pt-4">
        <div className="mb-4 flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
            JS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Jane Student</span>
            <span className="text-xs text-gray-500">jane@example.com</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 px-3">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
