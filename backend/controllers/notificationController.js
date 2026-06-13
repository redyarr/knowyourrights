const { Notification, UserNotification, User, Lawyer, Education, Contact, Post, ProfileImage, Connection } = require('../models');

exports.getNotifications = async (req, res) => {
    const userId = req.params.id || req.session.user_id;
    const wantsJson = req.headers.accept?.includes('application/json') || req.query.format === 'json';

    if (!userId) {
        if (wantsJson) return res.status(400).json({ success: false, error: "User ID is required." });
        return res.status(400).render('error', { error: "User ID is required." });
    }

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
            if (wantsJson) return res.status(404).json({ success: false, error: "User profile not found." });
            return res.status(404).render('error', { error: "User profile not found." });
        }

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

        // Return JSON for Next.js frontend
        if (wantsJson) {
            return res.json({
                success: true,
                notifications: notifications.map(n => ({
                    id: n.id,
                    isRead: n.isRead,
                    createdAt: n.createdAt,
                    title: n.Notification?.title || 'Notification',
                    message: n.Notification?.message || ''
                })),
                unreadCount: notifications.filter(n => !n.isRead).length
            });
        }

        // Legacy EJS rendering
        res.render('notifications', {
            title: 'Profile | Legal Network',
            profile: user,
            user: req.session.user,
            notifications
        });

    } catch (error) {
        console.error("getNotifications: Error occurred:", error.message);
        if (wantsJson) return res.status(500).json({ success: false, error: "An unexpected error occurred." });
        res.status(500).render('error', { error: "An unexpected error occurred. Please try again later." });
    }
};

exports.markAsRead = async (req, res) => {
    const wantsJson = req.headers.accept?.includes('application/json') || req.query.format === 'json';
    try {
        const { notificationId } = req.body;
        await UserNotification.update(
            { isRead: true },
            { where: { userId: req.session.user_id, id: notificationId } }
        );
        if (wantsJson) return res.json({ success: true });
        res.redirect('/notifications');
    } catch (error) {
        if (wantsJson) return res.status(500).json({ success: false, error: error.message });
        res.status(500).render('error', { error: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await UserNotification.update(
            { isRead: true },
            { where: { userId: req.session.user_id, isRead: false } }
        );
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};