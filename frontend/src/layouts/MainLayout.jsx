import React from 'react';

export default function MainLayout({ children, sidebar }) {
  return (
    // Adicionámos dark:bg-slate-900 e dark:text-white
    <div className="relative flex h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100 transition-colors duration-300">
      {sidebar}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}