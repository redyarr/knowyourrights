'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../components/useHook';
import { toast } from "sonner";
import LeftSidebar from '../components/feed/LeftSidebar';
import RightSidebar from '../components/feed/RightSidebar';
import PostCard from '../components/feed/PostCard';
import PostCreateForm from '../components/feed/PostCreateForm';

const FeedPage = () => {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
          description: data.error || "Please try again later"
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

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Skeleton */}
            <div className="hidden lg:block lg:col-span-3 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
            
            {/* Main Content Skeleton */}
            <div className="lg:col-span-6 space-y-6">
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
            
            {/* Right Sidebar Skeleton */}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <LeftSidebar userData={userData} />
          </div>

          {/* Main Content */}
          <main className="lg:col-span-6 space-y-6">
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

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;