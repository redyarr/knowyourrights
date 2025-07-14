'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../components/useHook';
import { toast } from "sonner";
import LeftSidebar from '../components/feed/LeftSidebar';
import RightSidebar from '../components/feed/RightSidebar';
import PostCard from '../components/feed/PostCard';
import PostCreateForm from '../components/feed/PostCreateForm';
import Link from 'next/link';
import { X, AlertTriangle, Clock, Eye, HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';


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
  
  // Custom hook to handle authentication refresh
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
        toast("Failed to load posts", {
          description:  "Please try again later"
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast("Network Error", {
        description: "Failed to load posts. Please check your connection."
      });
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
      // Remove deleted post from the list
      setPosts(prev => prev.filter(post => post.id !== deletedPostId));
    } else if (updatedPost) {
      // Update existing post
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Sidebar Skeleton - visible from md up */}
            <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Main Content Skeleton */}
            <div className="md:col-span-8 lg:col-span-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-muted rounded-full animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-1/4 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-4/6 animate-pulse"></div>
                  </div>
                  <div className="h-48 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Right Sidebar Skeleton - only visible on lg+ */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - visible from md up, smaller on md */}
          <div className="md:col-span-4 lg:col-span-3">
            <LeftSidebar userData={userData} />
          </div>

          {/* Main Content - takes remaining space */}
          <main className="md:col-span-8 lg:col-span-6 space-y-6">
            {/* Verification Warning */}
            {userData?.role === 'lawyer' && 
             userData?.lawyerVerivicationStatus !== 'approved' && 
             showVerificationWarning && (
              <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 shadow-sm">
                {/* Dismiss Button */}
                <button
                  onClick={() => setShowVerificationWarning(false)}
                  className="absolute top-4 right-4 p-1 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors duration-200"
                  aria-label="Dismiss notification"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-start space-x-4">
                  {/* Warning Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                        Account Verification Pending
                      </h3>
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        {userData?.lawyerVerivicationStatus === 'pending' ? 'Under Review' : 'Verification Required'}
                      </Badge>
                    </div>
                    
                    <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed mb-4">
                      {userData?.lawyerVerivicationStatus === 'pending' 
                        ? "Thank you for submitting your verification documents! Our team is currently reviewing your credentials to ensure the highest quality of legal professionals on our platform."
                        : "To maintain the integrity of our legal community, we require all lawyers to complete verification before sharing content."
                      }
                    </p>

                    <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        What happens next?
                      </h4>
                      <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                        {userData?.lawyerVerivicationStatus === 'pending' ? (
                          <>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Our verification team will review your documents within 2-3 business days
                            </li>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              You'll receive an email notification once the review is complete
                            </li>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Once approved, you'll be able to share legal insights and connect with the community
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Complete your profile with required legal credentials
                            </li>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Upload verification documents (bar certification, license, etc.)
                            </li>
                            <li className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Wait for our team to verify your credentials
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {userData?.lawyerVerivicationStatus === 'pending' && (
                        <>
                          <Button variant="ghost" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/20 w-fit" asChild>
                            <Link href="/help/verification" className="flex items-center">
                              <HelpCircle className="h-4 w-4 mr-2" />
                              Get Help
                            </Link>
                          </Button>
                        </>
                      ) }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Post Creation Form */}
            <PostCreateForm 
              userData={userData} 
              onPostCreated={handlePostCreated} 
            />

            {/* Posts */}
            <div className="space-y-6">
             
              {posts.length === 0 ? (
                <div className="bg-card rounded-lg border p-8 text-center">
                  <div className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl p-6">
                    <h3 className="text-lg font-medium mb-2">No posts found</h3>
                    <p className="text-sm">
                      {userData?.userType === 'lawyer' 
                        ? "Be the first to share your legal insights!" 
                        : "Check back later for legal insights from our verified lawyers."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                posts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userData={userData}
                    onPostUpdate={handlePostUpdate}
                    // Add observer ref to the target post (10th, 30th, 50th, etc.)
                    observerRef={index === targetPostIndex.current - 1 ? observerRef : null}
                  />
                ))
              )}
              
              {/* Loading indicator for infinite scroll */}
              {loadingMore && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Loading more posts...</span>
                  </div>
                </div>
              )}
              
              {/* End of posts indicator */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    You've reached the end of your feed
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Right Sidebar - only visible on lg+ */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;