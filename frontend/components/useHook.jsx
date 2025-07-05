'use client'

import { useEffect } from "react";

// app/hooks/useAuth.js
export function useAuth() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log('Refreshing token...');
        
        await fetch('http://localhost:3001/refresh-token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });          
          } catch (error) {
        console.error('Error refreshing token:', error);
      }
      }, 50 * 60 * 1000); // every 50 mins

    return () => clearInterval(interval);
  }, []);
}
