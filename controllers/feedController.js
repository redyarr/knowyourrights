const { Post, User, Lawyer, Comment, React, PostPhoto, Photo } = require('../models');

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'role'],
                    include: [{ model: Lawyer }]
                },
                {
                    model: Comment,
                    include: [{ model: User, attributes: ['first_name', 'last_name'], }]
                },
                {
                    model: React,
                    attributes: ['reaction']
                },
                {
                    model: PostPhoto,
                    include: [{ model: Photo }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.render('feed/index', {
            title: 'Home | Legal Network',
            posts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        const { title, content } = req.body;
        // Only allow editing if the user is the author
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this post." });
        }
        await post.update({ title, content });
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
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this post." });
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
        const userId = req.session.user_id;
        const { content } = req.body;
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this comment." });
        }
        await comment.update({ content });
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
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this comment." });
        }
        await comment.destroy();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Handle post reactions
exports.reactToPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        const { reaction } = req.body;
        
        // Check if user has already reacted to this post
        const existingReaction = await React.findOne({
            where: { userId, postId }
        });
        
        if (existingReaction) {
            // Update existing reaction
            await existingReaction.update({ reaction });
        } else {
            // Create new reaction
            await React.create({
                userId,
                postId,
                reaction
            });
        }
        
        // Return JSON response for AJAX requests
        return res.json({ success: true });
    } catch (error) {
        console.error('Error reacting to post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        const { title, content } = req.body;
        // Only allow editing if the user is the author
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this post." });
        }
        await post.update({ title, content });
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
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this post." });
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
        const userId = req.session.user_id;
        const { content } = req.body;
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this comment." });
        }
        await comment.update({ content });
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
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this comment." });
        }
        await comment.destroy();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Handle post comments
exports.commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        const { content } = req.body;
        
        // Create new comment
        const comment = await Comment.create({
            userId,
            postId,
            content
        });
        
        // Get user info for the new comment
        const user = await User.findByPk(userId, {
            attributes: ['first_name', 'last_name']
        });
        
        // Return JSON response with the new comment data
        return res.json({
            success: true,
            comment: {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    firstName: user.first_name,
                    lastName: user.last_name
                }
            }
        });
    } catch (error) {
        console.error('Error commenting on post:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Edit a post
exports.editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.session.user_id;
        const { title, content } = req.body;
        // Only allow editing if the user is the author
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this post." });
        }
        await post.update({ title, content });
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
        const post = await Post.findOne({ where: { id: postId, authorId: userId } });
        if (!post) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this post." });
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
        const userId = req.session.user_id;
        const { content } = req.body;
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to edit this comment." });
        }
        await comment.update({ content });
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
        const comment = await Comment.findOne({ where: { id: commentId, userId } });
        if (!comment) {
            return res.status(403).json({ success: false, error: "You do not have permission to delete this comment." });
        }
        await comment.destroy();
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};