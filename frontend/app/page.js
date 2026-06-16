'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../components/useHook';
import { toast } from "sonner";
import LeftSidebar from '../components/feed/LeftSidebar';
import RightSidebar from '../components/feed/RightSidebar';
import PostCard from '../components/feed/PostCard';
import PostCreateForm from '../components/feed/PostCreateForm';
import Link from 'next/link';
import { X, AlertTriangle, Clock, HelpCircle, Compass, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

const FeedPage = () => {
  const [userData, setUserData] = useState(null);  
  const [posts, setPosts] = useState([]);     
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showVerificationWarning, setShowVerificationWarning] = useState(true);
  const observerRef = useRef(null);
  const targetPostIndex = useRef(10); 
  
  // Handle authentication refresh
  useAuth();

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/getuserdata');
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.payload);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`http://localhost:3001/feed?page=${page}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const newPosts = data.posts || [];
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasMore(data.pagination?.hasMore || false);
        setCurrentPage(page);
        
        if (append && newPosts.length > 0) {
          targetPostIndex.current = posts.length + 10;
        }
      } else {
        toast.error("Failed to load posts from legal community");
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error("Network Error: Failed to load posts.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [posts.length]);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
      fetchPosts(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleIntersection]);

  useEffect(() => {
    fetchUserData();
    fetchPosts(1);
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    targetPostIndex.current = 11; 
  };

  const handlePostUpdate = (updatedPost, deletedPostId = null) => {
    if (deletedPostId) {
      setPosts(prev => prev.filter(post => post.id !== deletedPostId));
    } else if (updatedPost) {
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
            <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 space-y-3 animate-pulse">
                  <div className="h-4.5 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3.5 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
            
            <div className="md:col-span-8 lg:col-span-6 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-6 space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="h-11 w-11 bg-muted rounded-full"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/5"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 bg-muted rounded w-full"></div>
                    <div className="h-3.5 bg-muted rounded w-5/6"></div>
                  </div>
                  <div className="h-40 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
            
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-4 space-y-3 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3.5 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Visual background blurred ambient lighting */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-4 lg:col-span-3">
            <LeftSidebar userData={userData} />
          </div>

          {/* Main Content */}
          <main className="md:col-span-8 lg:col-span-6 space-y-6">
            {/* Pending Advocate Verification Alert */}
            {userData?.role === 'lawyer' && 
             userData?.lawyerVerivicationStatus !== 'approved' && 
             showVerificationWarning && (
              <div className="relative bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 shadow-sm">
                <button
                  onClick={() => setShowVerificationWarning(false)}
                  className="absolute top-4 right-4 p-1 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-full transition"
                  aria-label="Dismiss warning"
                >
                  <X className="h-4.5 w-4.5" />
                </button>

                <div className="flex items-start space-x-3.5">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      <h3 className="text-sm font-extrabold text-amber-950 dark:text-slate-100">
                        Credentials Verification Underway
                      </h3>
                      <Badge className="text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/40">
                        {userData?.lawyerVerivicationStatus === 'pending' ? 'Reviewing' : 'Awaiting Docs'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-amber-800 dark:text-amber-350 leading-relaxed mb-4 font-medium">
                      {userData?.lawyerVerivicationStatus === 'pending' 
                        ? "We are currently validating your badge and bar credentials. This usually completes within 48 hours."
                        : "To participate in active legal discussions, please upload your certification papers in Settings."
                      }
                    </p>

                    <div className="bg-white/60 dark:bg-slate-950/50 rounded-xl p-3.5 mb-3.5 border border-amber-100/50 dark:border-amber-900/30">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        Verification Timeline
                      </h4>
                      <ul className="text-[11px] text-amber-800 dark:text-amber-350 space-y-1.5 font-medium">
                        {userData?.lawyerVerivicationStatus === 'pending' ? (
                          <>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0"></span>
                              Our verification team verifies bar registers (2-3 business days)
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0"></span>
                              Email alerts will be sent immediately upon status update
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0"></span>
                              Submit license codes & certificates
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0"></span>
                              Gain client recommendation capabilities upon approval
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {userData?.lawyerVerivicationStatus === 'pending' && (
                      <Button variant="outline" size="sm" className="text-amber-700 hover:text-amber-900 dark:text-amber-350 dark:hover:text-amber-250 border-amber-200 dark:border-amber-900 hover:bg-amber-100/40 text-xs font-bold" asChild>
                        <Link href="/help" className="flex items-center">
                          <HelpCircle className="h-3.5 w-3.5 mr-1" /> Help Desk
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create Post Interface */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-sm">
              <PostCreateForm 
                userData={userData} 
                onPostCreated={handlePostCreated} 
              />
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-12 text-center">
                  <div className="space-y-3.5 max-w-sm mx-auto">
                    <Compass className="h-8 w-8 text-slate-300 mx-auto" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Welcome to your home feed</h3>
                    <p className="text-xs text-slate-500">
                      {userData?.userType === 'lawyer' 
                        ? "Be the first to publish legal articles and counsel references!" 
                        : "Verified attorney write-ups and advisory listings will appear here."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                posts.map((post, index) => (
                  <Card key={post.id} className="border border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900 p-5 rounded-2xl overflow-hidden">
                    <PostCard
                      post={post}
                      userData={userData}
                      onPostUpdate={handlePostUpdate}
                      observerRef={index === targetPostIndex.current - 1 ? observerRef : null}
                    />
                  </Card>
                ))
              )}
              
              {/* Infinite Scroll Loader */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs font-semibold">Fetching community posts...</span>
                  </div>
                </div>
              )}
              
              {/* End of Posts Indicator */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 text-xs font-bold flex items-center justify-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" /> You're completely up to date
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;