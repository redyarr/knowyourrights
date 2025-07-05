'use client';

import { useAuth } from '../components/useHook';

const Page = () => {
  // Custom hook to handle authentication refresh
  // This will automatically refresh the auth token every 50 minutes
  useAuth();
  
  

  return (
   <>
   
   </>
  );
};

export default Page;