const { Post, User, Lawyer, Comment, React } = require('../models');

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
                }
            ],
            order: [['created_at', 'DESC']]
        });
        // console.log("all posts:\n", posts);
        // console.log("1st post:\n", posts[0]);
        // console.log("poster:\n", posts[0].dataValues.user);
        // console.log("1st react:\n", posts[0].dataValues.reacts[0]);
        // console.log("1st comment:\n", posts[0].dataValues.Comments);
        // console.log("user:\n", req.session.user);
        posts.forEach(post => {
                console.log("Post User law:", post.user.dataValues);
        });
        // posts.forEach(post => {
        //     if (post.user.role==='lawyer' && post.user.lawyer) {
        //         console.log("Post User law:", post.user.lawyer);
        //     }
        // });
            
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