import React from 'react';

const tabs = ['overview', 'materials', 'flashcards', 'tests', 'analytics'];

export default function TopicWorkspaceTabs({ activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
              ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
