import React from 'react';

export default function MainLayout({ children, sidebar }) {
  return (
    <div className="relative flex h-screen bg-[#f3f4f6] dark:bg-[#090a0f] font-sans text-slate-900 transition-colors duration-300 overflow-hidden z-0">
      {/* Background Decorativo - Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-300/30 dark:bg-indigo-900/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-teal-300/20 dark:bg-teal-900/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-60"></div>
        <div className="absolute top-[20%] right-[20%] w-[20vw] h-[20vw] bg-violet-300/20 dark:bg-violet-900/10 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
      </div>

      {sidebar}
      
      <main className="flex-1 p-6 h-screen overflow-y-auto min-w-0">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}