const { User, Lawyer, Education, Contact, Post, ProfileImage } = require('../models');

exports.getProfile = async (req, res) => {
    const userId = req.params.id || req.session.user_id;
    try {
        const user = await User.findOne({
            where: { id: userId },
            include: [
                { 
                    model: Lawyer,
                    include: [{ model: Education }]
                },
                { model: Contact },
                { model: Post },
                { model: ProfileImage }
            ]
        });
        console.log("here it comes:");
        console.log(user);
        res.render('user/profile', {
            title: 'Profile | Legal Network',
            profile: user,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
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