const { Notification, UserNotification, User } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        console.log('Fetching notifications for user:', req.session.user_id);
        const notifications = await UserNotification.findAll({
            where: { user_id: req.session.user_id },
            include: [{ model: Notification }],
            order: [['created_at', 'DESC']]
        });
        console.log('Notifications fetched:', notifications);

        res.render('user/notifications', {
            title: 'Notifications | Legal Network',
            notifications,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).render('error', { error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        await UserNotification.update(
            { isRead: true },
            { where: { userId: req.session.user_id, notificationId } }
        );
        res.redirect('/notifications');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};