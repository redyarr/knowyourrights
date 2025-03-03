const { Users, Notifications } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('Fetching notifications for user:', userId);
        
        // Get all notifications for the user
        const notifications = await Notifications.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        console.log('Fetched notifications:', notifications);
        
        // Count unread notifications
        const unreadCount = await Notifications.count({
            where: {
                userId,
                isRead: false
            }
        });
        console.log('Unread notifications count:', unreadCount);
        
        res.render('user/notifications', {
            title: 'Notifications',
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Server error');
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const notificationId = req.params.notificationId;
        
        // Find notification
        const notification = await Notifications.findOne({
            where: {
                id: notificationId,
                userId
            }
        });
        
        if (!notification) {
            return res.status(404).send('Notification not found');
        }
        
        // Mark as read
        await notification.update({ isRead: true });
        
        res.redirect(`/user/${userId}/notifications`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).send('Server error');
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        // Mark all notifications as read
        await Notifications.update(
            { isRead: true },
            {
                where: {
                    userId,
                    isRead: false
                }
            }
        );
        
        res.redirect(`/user/${userId}/notifications`);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).send('Server error');
    }
};