const { User, Lawyer, Education, Contact, Post, ProfileImage, Connection, } = require('../models');

exports.getProfile = async (req, res) => {
    const userId = req.params.id || req.session.user_id;

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

        res.render('user/profile', {
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