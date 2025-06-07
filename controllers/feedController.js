const { Post, User, Lawyer, React, Comment, Share, Photo, PostPhoto } = require('../models');
const { Op } = require('sequelize');
const imagekit = require('../config/imagekit');

// Create a new post (only lawyers can post)
exports.createPost = async (req, res) => {
    try {
        // Check if user is a lawyer
        if (req.session.user?.role !== 'lawyer') {
            return res.status(403).json({ success: false, error: "Only lawyers can create posts." });
        }

        const { title, content, category } = req.body;
        const userId = req.session.user_id;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: "Title and content are required." });
        }

        const post = await Post.create({
            title,
            content,
            category: category || 'General',
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Handle image upload if present
        if (req.file) {
            try {
                // Upload image to ImageKit.io
                const uploadResponse = await imagekit.upload({
                    file: req.file.buffer, // Use buffer from memory storage
                    fileName: `post_${post.id}_${Date.now()}_${req.file.originalname}`,
                    folder: '/posts', // Organize images in folders
                    useUniqueFileName: true,
                    tags: ['post', 'user_upload']
                });

                // Create photo record with ImageKit URL
                const photo = await Photo.create({
                    photoPath: uploadResponse.url // Store the ImageKit URL
                });

                // Create post-photo association
                await PostPhoto.create({
                    postId: post.id,
                    photoId: photo.id
                });
            } catch (imageError) {
                console.error('Error uploading image to ImageKit:', imageError);
                // Continue without failing the post creation
            }
        }

        return res.json({ success: true, post });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get all posts with user and lawyer information
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [{
                        model: Lawyer,
                        attributes: ['legalAreas', 'summary', 'lawFirm', 'badgeIssuingAuthority']
                    }]
                },
                {
                    model: React,
                    attributes: ['id', 'reaction', 'userId']
                },
                {
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'firstName', 'lastName', 'role']
                    }],
                    order: [['createdAt', 'ASC']]
                },
                {
                    model: require('../models').PostPhoto,
                    include: [{
                        model: require('../models').Photo,
                        attributes: ['id', 'photoPath']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate reaction stats for each post
        const postsWithStats = posts.map(post => {
            const reactions = post.Reacts || [];
            const reactionStats = {
                like: reactions.filter(r => r.reaction === 'like').length,
                love: reactions.filter(r => r.reaction === 'love').length,
                haha: reactions.filter(r => r.reaction === 'haha').length,
                wow: reactions.filter(r => r.reaction === 'wow').length,
                sad: reactions.filter(r => r.reaction === 'sad').length,
                angry: reactions.filter(r => r.reaction === 'angry').length
            };

            // Find user's reaction if logged in
            const userId = req.session.user_id;
            const userReaction = userId ? reactions.find(r => r.userId === userId) : null;

            return {
                ...post.toJSON(),
                reactionStats,
                userReaction: userReaction ? userReaction.reaction : null
            };
        });

        return res.json({ success: true, posts: postsWithStats });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get posts for feed page
exports.getFeedPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [{
                        model: Lawyer,
                        attributes: ['legalAreas', 'summary', 'lawFirm', 'badgeIssuingAuthority']
                    }]
                },
                {
                    model: React,
                    attributes: ['id', 'reaction', 'userId']
                },
                {
                    model: Comment,
                    include: [{
                        model: User,
                        attributes: ['id', 'firstName', 'lastName', 'role']
                    }],
                    order: [['createdAt', 'ASC']]
                },
                {
                    model: require('../models').PostPhoto,
                    include: [{
                        model: require('../models').Photo,
                        attributes: ['id', 'photoPath']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Calculate reaction stats for each post
        const postsWithStats = posts.map(post => {
            const reactions = post.Reacts || [];
            const reactionStats = {
                like: reactions.filter(r => r.reaction === 'like').length,
                love: reactions.filter(r => r.reaction === 'love').length,
                haha: reactions.filter(r => r.reaction === 'haha').length,
                wow: reactions.filter(r => r.reaction === 'wow').length,
                sad: reactions.filter(r => r.reaction === 'sad').length,
                angry: reactions.filter(r => r.reaction === 'angry').length
            };

            // Find user's reaction if logged in
            const userId = req.session.user_id;
            const userReaction = userId ? reactions.find(r => r.userId === userId) : null;

            return {
                ...post.toJSON(),
                reactionStats,
                userReaction: userReaction ? userReaction.reaction : null
            };
        });

        res.render('feed/index', {
            posts: postsWithStats,
            loggedInUserId: req.session.user_id,
            userRole: req.session.user?.role,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching feed posts:', error);
        res.status(500).render('error', { error: 'Failed to load feed' });
    }
};

// Handle post reactions
exports.reactToPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { reaction } = req.body;
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Please log in to react to posts." });
        }

        if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reaction)) {
            return res.status(400).json({ success: false, error: "Invalid reaction type." });
        }

        // Check if user already reacted to this post
        const existingReaction = await React.findOne({ where: { userId, postId } });

        if (existingReaction) {
            if (existingReaction.reaction === reaction) {
                // Remove reaction if same type
                await existingReaction.destroy();
            } else {
                // Update reaction type
                existingReaction.reaction = reaction;
                await existingReaction.save();
            }
        } else {
            // Create new reaction
            await React.create({ userId, postId, reaction: reaction });
        }

        // Get updated reactions for this post
        const reactions = await React.findAll({ where: { postId } });
        const reactionStats = {
            like: reactions.filter(r => r.reaction === 'like').length,
            love: reactions.filter(r => r.reaction === 'love').length,
            haha: reactions.filter(r => r.reaction === 'haha').length,
            wow: reactions.filter(r => r.reaction === 'wow').length,
            sad: reactions.filter(r => r.reaction === 'sad').length,
            angry: reactions.filter(r => r.reaction === 'angry').length
        };

        const userReaction = reactions.find(r => r.userId === userId);

        return res.json({
            success: true,
            reactions: reactions,
            reactionStats: reactionStats,
            userReaction: userReaction ? userReaction.reaction : null
        });
    } catch (error) {
        console.error('Error handling reaction:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Handle post comments
exports.commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Please log in to comment on posts." });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: "Comment content is required." });
        }

        const comment = await Comment.create({
            content: content.trim(),
            userId,
            postId,
            createdAt: new Date()
        });

        // Get the comment with user information
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'role']
            }]
        });

        return res.json({ success: true, comment: commentWithUser });
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, category } = req.body;
        const userId = req.session.user_id;

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found." });
        }

        // Check if user owns the post or is admin
        if (post.userId !== userId && req.session.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "You can only edit your own posts." });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.updatedAt = new Date();
        
        await post.save();
        return res.json({ success: true, post });
    } catch (error) {
        console.error('Error editing post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;

        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found." });
        }

        // Check if user owns the post or is admin
        if (post.userId !== userId && req.session.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "You can only delete your own posts." });
        }

        await post.destroy();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Edit a comment
exports.editComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const { content } = req.body;
        const userId = req.session.user_id;

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: "Comment not found." });
        }

        // Check if user owns the comment or is admin
        if (comment.userId !== userId && req.session.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "You can only edit your own comments." });
        }

        comment.content = content || comment.content;
        comment.updatedAt = new Date();
        
        await comment.save();
        return res.json({ success: true, comment });
    } catch (error) {
        console.error('Error editing comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.session.user_id;

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, error: "Comment not found." });
        }

        // Check if user owns the comment or is admin
        if (comment.userId !== userId && req.session.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: "You can only delete your own comments." });
        };
        await comment.destroy();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Share a post
exports.sharePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        
        // Check if user is logged in
        if (!userId) {
            return res.status(401).json({ success: false, error: "Please log in to share posts." });
        }
        
        // Check if post exists
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ success: false, error: "Post not found." });
        }
        
        // Check if user has already shared this post
        const existingShare = await Share.findOne({ where: { userId, postId } });
        if (existingShare) {
            return res.status(400).json({ success: false, error: "You have already shared this post." });
        }
        
        // Create the share
        const share = await Share.create({
            userId,
            postId,
            createdAt: new Date()
        });
        
        // Get updated share count
        const shareCount = await Share.count({ where: { postId } });
        
        return res.json({ 
            success: true, 
            message: "Post shared successfully!",
            shareCount
        });
    } catch (error) {
        console.error('Error sharing post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get shared posts for a user
exports.getSharedPosts = async (req, res) => {
    try {
        const userId = req.params.userId || req.session.user_id;
        
        const sharedPosts = await Share.findAll({
            where: { userId },
            include: [{
                model: Post,
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [{ model: Lawyer }]
                }]
            }],
            order: [['createdAt', 'DESC']]
        });
        
        return res.json({ success: true, sharedPosts });
    } catch (error) {
        console.error('Error getting shared posts:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};