'use client';

import { useEffect, useState } from 'react';

export default function EnvironmentBanner() {
  const [environment, setEnvironment] = useState<string>('');

  useEffect(() => {
    // Check if we're in development
    const isDev = process.env.NODE_ENV === 'development' || 
                  window.location.hostname === 'localhost' ||
                  window.location.hostname.includes('git-dev');
    
    if (isDev) {
      setEnvironment('development');
    }
  }, []);

  if (environment !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
      🚧 DEVELOPMENT ENVIRONMENT - Safe for testing 🚧
    </div>
  );
}