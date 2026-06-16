'use client'

import { useEffect } from "react";

// app/hooks/useAuth.js
export function useAuth() {
  useEffect(() => {
    // ✅ 1️⃣ On first mount: refresh immediately
    const refreshNow = async () => {
      try {
        await fetch('http://localhost:3001/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error refreshing token on mount:', error);
      }
    };

    refreshNow();

    // ✅ 2️⃣ Then refresh every 30 mins
    const interval = setInterval(async () => {
      try {
        console.log('Refreshing token (interval)...');
        await fetch('http://localhost:3001/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error refreshing token (interval):', error);
      }
    }, 30 * 60 * 1000); // every 30 mins

    return () => clearInterval(interval);
  }, []);
}
