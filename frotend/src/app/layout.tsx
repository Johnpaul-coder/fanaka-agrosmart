import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <nav className="sticky top-0 z-50 bg-green-700 text-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Fanaka AGROSMART</h1>
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <a href="/" className="hover:text-green-200">Home</a>
            <a href="/marketplace" className="hover:text-green-200">Marketplace</a>
            <a href="/dashboard" className="hover:text-green-200">Dashboard</a>
            <a href="/scanner" className="hover:text-green-200 underline decoration-2">AI Scanner</a>
          </div>
          <button className="bg-orange-500 px-4 py-2 rounded-lg text-sm font-bold">Login</button>
        </nav>
        <main className="max-w-7xl mx-auto">{children}</main>
        <footer className="p-8 bg-gray-800 text-gray-400 text-center text-sm">
          &copy; 2026 Fanaka AGROSMART. Transforming Agriculture Online.
        </footer>
      </body>
    </html>
  );
}
