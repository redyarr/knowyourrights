const { User, Lawyer, Education, Contact, Post, Connection, ProfileImage, Comment, React } = require('../models');
const multer = require('multer');
const path = require('path');
const { PostPhoto, Photo } = require('../models');
const imagekit = require('../config/imagekit');

exports.findProfile = async (req, res) => {
    const userId = req.session.user_id;
    const { Op } = require('sequelize');
    
    try{
        const user = await User.findOne({
            where: { id: userId },
            include: [
                {
                    model: Lawyer,
                },
                {
                    model: ProfileImage
                },
                {
                    model: Contact,
                },
                {
                    model: Post,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: PostPhoto,
                            include: [
                                {
                                    model: Photo,
                                }
                            ]
                        },
                        {
                            model: Comment,
                            include: [{
                                model: User,
                                attributes: ['id', 'firstName', 'lastName', 'role'],
                                include: [
                                    {
                                        model: ProfileImage
                                    }
                                ]
                            }],
                            order: [['createdAt', 'ASC']]
                        },
                        {
                            model: React
                        }
                    ]
                }
            ]
        });

         const connectionsCount = await Connection.count({
            where: {
                [Op.or]: [
                    { requester_id: userId, status: 'accepted' },
                    { receiver_id: userId, status: 'accepted' }
                ]
            }
        });


        return res.status(200).json({success : true, user: user, connectionsCount: connectionsCount});
        
    }catch(err){
        res.status(500).json({success: false, message: "Error geting user profile"})
    }
};

exports.getProfile = async (req, res) => {
    const userId = req.params.id;
    const loggedInUserId = req.session.user_id;
    const { Op } = require('sequelize');
    
    try {
        const user = await User.findOne({
            where: { id: userId },
            include: [
                {
                    model: Lawyer,
                },
                {
                    model: ProfileImage
                },
                {
                    model: Contact,
                },
                {
                    model: Post,
                    order: [['createdAt', 'DESC']],
                    include: [
                        {
                            model: PostPhoto,
                            include: [
                                {
                                    model: Photo,
                                }
                            ]
                        },
                        {
                            model: Comment,
                            include: [{
                                model: User,
                                attributes: ['id', 'firstName', 'lastName', 'role'],
                                include: [
                                    {
                                        model: ProfileImage
                                    }
                                ]
                            }],
                            order: [['createdAt', 'ASC']]
                        },
                        {
                            model: React
                        }
                    ]
                }
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

        res.status(200).json({success: true, data :{
            user: user,
            loggedInUserId: loggedInUserId,
            connectionStatus: connectionStatus,
            connectionsCount: connectionsCount
        }});

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
        const { firstName, lastName, summary, lawFirm, licenseNumber, country, city, legalAreas, interests } = req.body;
        
        // Update user
        await User.update(
            { firstName, lastName, country, city, interests },
            { where: { id: req.session.user_id } }
        );

        // Update lawyer profile if exists
        if (req.session.user.role === 'lawyer') {
            await Lawyer.update(
                { 
                    lawFirm,
                    licenseNumber,
                    summery: summary,
                    legalAreas
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

// Multer configuration for ImageKit (memory storage)
const upload = multer({ 
    storage: multer.memoryStorage(),
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

// Profile image upload configuration
const profileUpload = multer({ 
    storage: multer.memoryStorage(),
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
        const userRole = req.session.user?.role;
        
        // Only allow lawyers to create posts
        if (userRole !== 'lawyer') {
            return res.status(403).render('error', { 
                error: 'Access denied. Only lawyers can create posts.' 
            });
        }
        
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
            console.log('📸 Profile post file detected:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                bufferLength: req.file.buffer ? req.file.buffer.length : 'No buffer'
            });
            
            try {
                console.log('🚀 Starting ImageKit upload for profile post...');
                
                // Upload image to ImageKit.io
                const uploadResponse = await imagekit.upload({
                    file: req.file.buffer, // Use buffer from memory storage
                    fileName: `post_${Date.now()}_${req.file.originalname}`,
                    folder: '/posts', // Organize images in folders
                    useUniqueFileName: true,
                    tags: ['post', 'user_upload']
                });

                console.log('✅ ImageKit upload successful for profile post:', {
                    url: uploadResponse.url,
                    fileId: uploadResponse.fileId,
                    name: uploadResponse.name
                });

                // Create photo record with ImageKit URL
                const photo = await Photo.create({
                    photoPath: uploadResponse.url // Store the ImageKit URL
                });

                console.log('💾 Profile post photo record created:', photo.id);

                // Create post-photo association
                await PostPhoto.create({
                    postId: post.id,
                    photoId: photo.id
                });

                console.log('🔗 Profile post-photo association created');
            } catch (imageError) {
                console.error('❌ Error uploading profile post image to ImageKit:', imageError);
                console.error('Error details:', {
                    message: imageError.message,
                    stack: imageError.stack,
                    response: imageError.response?.data
                });
                // Continue without failing the post creation
            }
        } else {
            console.log('📷 No file detected in profile post request');
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

        console.log('📸 Profile image file details:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            bufferLength: req.file.buffer ? req.file.buffer.length : 'No buffer'
        });

        console.log('🚀 Starting ImageKit upload for profile image...');
        console.log('ImageKit config check:', {
            hasPublicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
            hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
            hasUrlEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        // Upload image to ImageKit.io
        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: `profile_${userId}_${Date.now()}_${req.file.originalname}`,
            folder: '/profiles',
            useUniqueFileName: true,
            tags: ['profile', 'user_avatar']
        });

        console.log('✅ ImageKit upload successful for profile:', {
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
            name: uploadResponse.name,
            size: uploadResponse.size
        });

        const imagePath = uploadResponse.url;
        console.log('💾 Profile image URL to save:', imagePath);

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
        console.error('❌ Error uploading profile image:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        res.status(500).json({ error: 'Failed to upload profile image: ' + error.message });
    }
}];

// Export multer middleware for use in routes
exports.profileUpload = profileUpload;
