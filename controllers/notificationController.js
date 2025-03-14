const { UserNotification, User, Lawyer, Education, Contact, Post, ProfileImage, Connection } = require('../models');

exports.getNotifications = async (req, res) => {
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

        res.render('user/notification', {
            title: 'Profile | Legal Network',
            profile: user,
            user: req.session.user
        });

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).render('error', { error: "An unexpected error occurred." });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        await UserNotification.update(
            { isRead: true },
            { where: { userId: req.session.user_id, id: notificationId } }
        );
        res.redirect('/notifications');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};