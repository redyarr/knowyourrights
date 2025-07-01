const { Notification, UserNotification, User, Lawyer, Education, Contact, Post, ProfileImage, Connection } = require('../models');

exports.getNotifications = async (req, res) => {
    console.log("getNotifications: Start");

    const userId = req.params.id || req.session.user_id;

    if (!userId) {
        console.error("getNotifications: Missing userId");
        return res.status(400).render('error', { error: "User ID is required." });
    }

    try {
        console.log("getNotifications: Fetching user with ID =", userId);

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
            console.error("getNotifications: User not found");
            return res.status(404).render('error', { error: "User profile not found." });
        }

        console.log("getNotifications: Fetching notifications for user ID =", userId);

        const notifications = await UserNotification.findAll({
            where: { userId },
            include: [
                {
                    model: Notification,
                    attributes: ['id', 'title', 'message']
                }
            ],
    order: [['createdAt', 'DESC']]
});


        console.log("getNotifications: Successfully fetched notifications");
        console.log(notifications);
        
        res.render('notifications', {
            title: 'Profile | Legal Network',
            profile: user,
            user: req.session.user,
            notifications
        });

    } catch (error) {
        console.error("getNotifications: Error occurred:", error.message);
        res.status(500).render('error', { error: "An unexpected error occurred. Please try again later." });
    }

    console.log("getNotifications: End");
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