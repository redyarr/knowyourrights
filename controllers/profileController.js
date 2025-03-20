const { User, Lawyer, Education, Contact, Post, ProfileImage, Connection, } = require('../models');

exports.findProfile = async (req, res) => {
    const userId = req.session.user_id;
    res.redirect(`/in/${userId}`)
};

exports.getProfile = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude: ['password', 'emailVerifiedAt'] },
            include: [
                {
                    model: Lawyer,
                    include: [{ model: Education }]
                },
                { model: Contact },
                { model: Post },
                { model: ProfileImage },
                {
                    model: Connection,
                    as: 'connections',
                    attributes: ['id'],
                }
            ]
        });
                if (!user) {
            return res.status(404).render('error', { error: "User profile not found." });
        }

        res.render('profile', {
            title: 'Profile | Legal Network',
            profile: user,
            user: req.session.user
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).render('error', { error: "An unexpected error occurred." });
    }
};



exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, summary, lawFirm, licenseNumber } = req.body;
        
        // Update user
        await User.update(
            { firstName, lastName },
            { where: { id: req.session.user_id } }
        );

        // Update lawyer profile if exists
        if (req.session.user.role === 'lawyer') {
            await Lawyer.update(
                { 
                    lawFirm,
                    licenseNumber,
                    summery: summary
                },
                { where: { userId: req.session.user_id } }
            );
        }

        res.redirect('/profile');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.CreatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.params.id;

        // Create a new post
        const newPost = await Post.create({
            title,
            content,
            userId
        });

        res.redirect(`/profile/${userId}`);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while creating the post." });
    }
};

// Update an existing post
exports.updatePost = async (req, res) => {
    try {
        const { postId, title, content } = req.body;
        const userId = req.params.id;

        // Update the post
        const updatedPost = await Post.update(
            { title, content },
            { where: { id: postId, userId } }
        );

        if (!updatedPost[0]) {
            return res.status(404).render('error', { error: "Post not found or you don't have permission to edit it." });
        }

        res.redirect(`/profile/${userId}`);
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while updating the post." });
    }
};
