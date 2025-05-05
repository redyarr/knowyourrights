const { User, Lawyer, Education, Contact, Post, ProfileImage, Connection } = require('../models');
const multer = require('multer');
const path = require('path');
const { PostPhoto, Photo } = require('../models');

exports.findProfile = async (req, res) => {
    const userId = req.session.user_id;
    res.redirect(`/in/${userId}`)
};

exports.getProfile = async (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.session.user_id;
    const { Op } = require('sequelize');
    
    try {
        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude: ['password', 'emailVerifiedAt'] },
            include: [
                {
                    model: Lawyer,
                    as: 'lawyer',
                    include: [{ model: Education, as: 'Educations' }]
                },
                { model: Contact },
                { model: Post },
                { model: ProfileImage },
                {
                    model: Connection,
                    as: 'sentRequests',
                    attributes: ['id', 'status', 'requester_id', 'receiver_id'],
                },
                {
                    model: Connection,
                    as: 'receivedRequests',
                    attributes: ['id', 'status', 'requester_id', 'receiver_id'],
                }
            ]
        });
        
        if (!user) {
            return res.status(404).render('error', { error: "User profile not found." });
        }
        
        // Count connections
        const connectionsCount = user.connections ? user.connections.length : 0;
        
        // Check if logged-in user has a connection with this profile
        let connectionStatus = null;
        if (loggedInUserId && loggedInUserId !== userId) {
            const connection = await Connection.findOne({
                where: {
                    [Op.or]: [
                        { requester_id: loggedInUserId, receiver_id: userId },
                        { requester_id: userId, receiver_id: loggedInUserId }
                    ]
                }
            });
            
            connectionStatus = connection ? connection.status : null;
        }

        res.render('in/index', {
            title: 'Profile | Legal Network',
            profile: user,
            loggedInUserId: loggedInUserId,
            connectionStatus: connectionStatus,
            connectionsCount: connectionsCount
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

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/posts'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Updated CreatePost to handle image upload
exports.CreatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const authorId = req.params.id;
        // Validate the input
        if (!title || !content || !authorId) {
            return res.status(400).render('error', { error: "Missing required fields: title, content, or author ID." });
        }
        // Create the post
        const post = await Post.create({ authorId, title, content });
        // Handle image upload if present
        if (req.file) {
            const photo = await Photo.create({ photoPath: '/uploads/posts/' + req.file.filename });
            await PostPhoto.create({ postId: post.id, photoId: photo.id });
        }
        res.redirect(`/`);
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
