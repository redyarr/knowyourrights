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
                    include: [
                        { model: Education, as: 'Educations' },
                        { model: require('../models/lawwyerDoc'), as: 'lawyer_docs' }
                    ]
                },
                { model: Contact },
                { model: Post },
                { model: ProfileImage }
            ]
        });
        
        if (!user) {
            return res.status(404).render('error', { error: "User profile not found." });
        }
        
        // Count actual connections (accepted status only)
        const connectionsCount = await Connection.count({
            where: {
                [Op.or]: [
                    { requester_id: userId, status: 'accepted' },
                    { receiver_id: userId, status: 'accepted' }
                ]
            }
        });
        
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



exports.getEditProfile = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        const user = await User.findOne({
            where: { id: userId },
            attributes: { exclude: ['password', 'emailVerifiedAt'] },
            include: [
                {
                    model: Lawyer,
                    as: 'lawyer'
                }
            ]
        });
        
        if (!user) {
            return res.status(404).render('error', { error: "User not found." });
        }
        
        res.render('profile/edit', { 
            user,
            title: 'Edit Profile'
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, summary, lawFirm, licenseNumber, country, city } = req.body;
        
        // Update user
        await User.update(
            { firstName, lastName, country, city },
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

        // Update session user data
        const updatedUser = await User.findOne({
            where: { id: req.session.user_id },
            attributes: { exclude: ['password', 'emailVerifiedAt'] }
        });
        req.session.user = updatedUser;

        res.redirect('/in');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

// Multer storage configuration for posts
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

// Multer storage configuration for profile images
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const resolvedPath = path.join(__dirname, '../public/uploads/profiles');
        console.log('Multer profile image upload destination:', resolvedPath);
        cb(null, resolvedPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + '-' + file.originalname);
    }
});
const profileUpload = multer({ 
    storage: profileStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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

// Upload profile image
exports.uploadProfileImage = [profileUpload.single('profileImage'), async (req, res) => {
    console.log('Profile image upload request received');
    console.log('Session user_id:', req.session?.user_id);
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    try {
        const userId = req.session.user_id;
        
        if (!userId) {
            console.log('No user ID in session');
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        if (!req.file) {
            console.log('No file provided in request');
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log('File details:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        const imagePath = '/uploads/profiles/' + req.file.filename;
        console.log('Image path to save:', imagePath);

        // Check if user already has a profile image
        const existingImage = await ProfileImage.findOne({ where: { userId } });
        console.log('Existing image found:', existingImage ? 'Yes' : 'No');

        if (existingImage) {
            // Update existing profile image
            await ProfileImage.update(
                { imagePath },
                { where: { userId } }
            );
            console.log('Updated existing profile image');
        } else {
            // Create new profile image record
            await ProfileImage.create({
                userId,
                imagePath
            });
            console.log('Created new profile image record');
        }

        console.log('Profile image upload successful');
        res.json({ success: true, imagePath });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Failed to upload profile image: ' + error.message });
    }
}];

// Export multer middleware for use in routes
exports.profileUpload = profileUpload;
