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
            
        res.render('post/index', {
            title: 'Home | Legal Network',
            posts,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).render('error', { error: error.message });
    }
};