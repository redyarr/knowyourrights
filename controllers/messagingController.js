const { User, Connection, Message } = require('../models');
const { Op } = require('sequelize');

// Search for users
exports.searchUsers = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const query = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Users per page
        const offset = (page - 1) * limit;
        
        let whereClause = { id: { [Op.ne]: userId } }; // Exclude current user
        let totalUsers = 0;
        
        // If query exists, filter by it
        if (query) {
            whereClause = {
                ...whereClause,
                [Op.or]: [
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            };
        }
        
        // Count total users for pagination
        totalUsers = await User.count({ where: whereClause });
        
        // Get users with pagination
        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            limit,
            offset,
            order: [['firstName', 'ASC']]
        });
        
        // Calculate pagination info
        const totalPages = Math.ceil(totalUsers / limit);
        
        res.render('messaging/search', {
            title: 'Find Users',
            users,
            query,
            userId,
            user: req.session.user,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).send('Server error');
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('Fetching messages for user:', userId);
        
        // Get all conversations (unique users the current user has exchanged messages with)
        const sentMessages = await Message.findAll({
            where: { senderId: userId },
            attributes: ['receiverId'],
            group: ['receiverId']
        });
        console.log('Sent messages:', sentMessages);
        
        const receivedMessages = await Message.findAll({
            where: { receiverId: userId },
            attributes: ['senderId'],
            group: ['senderId']
        });
        console.log('Received messages:', receivedMessages);
        
        // Combine unique user IDs from sent and received messages
        const conversationUserIds = [
            ...new Set([
                ...sentMessages.map(m => m.receiverId),
                ...receivedMessages.map(m => m.senderId)
            ])
        ];
        console.log('Conversation user IDs:', conversationUserIds);
        
        // Get user details for each conversation
        const conversations = await User.findAll({
            where: { id: { [Op.in]: conversationUserIds } },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });
        console.log('Conversations:', conversations);
        
        // Get the latest message for each conversation
        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (user) => {
                const lastMessage = await Message.findOne({
                    where: {
                        [Op.or]: [
                            { senderId: userId, receiverId: user.id },
                            { senderId: user.id, receiverId: userId }
                        ]
                    },
                    order: [['createdAt', 'DESC']]
                });
                console.log(`Last message with user ${user.id}:`, lastMessage);
                
                // Count unread messages
                const unreadCount = await Message.count({
                    where: {
                        senderId: user.id,
                        receiverId: userId,
                        isRead: false
                    }
                });
                console.log(`Unread messages from user ${user.id}:`, unreadCount);
                
                return {
                    user,
                    lastMessage,
                    unreadCount
                };
            })
        );
        
        // Sort conversations by the latest message
        conversationsWithLastMessage.sort((a, b) => {
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });
        console.log('Sorted conversations:', conversationsWithLastMessage);
        
        res.render('messaging/index', {
            title: 'Messages',
            messages: conversationsWithLastMessage, // Pass the conversations as "messages"
            userId,
            activeConversation: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server error');
    }
};

exports.getConversation = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const conversationId = req.params.conversationId;
        
        // Check if users are connected
        const isConnected = await Connection.findOne({
            where: {
                [Op.or]: [
                    { requesterId: userId, receiverId: conversationId, status: 'accepted' },
                    { requesterId: conversationId, receiverId: userId, status: 'accepted' }
                ]
            }
        });
        
        // For now, skip connection check to allow messaging between any users
        // if (!isConnected) {
        //     return res.status(403).send('You need to be connected to message this user');
        // }
        
        // Get conversation partner details
        const conversationPartner = await User.findByPk(conversationId, {
            attributes: ['id', 'firstName', 'lastName', 'email']
        });
        
        if (!conversationPartner) {
            return res.status(404).send('User not found');
        }
        
        // Get messages between users
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: conversationId },
                    { senderId: conversationId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });
        
        // Mark received messages as read
        await Message.update(
            { isRead: true },
            {
                where: {
                    senderId: conversationId,
                    receiverId: userId,
                    isRead: false
                }
            }
        );
        
        // Get all conversations for the sidebar
        const sentMessages = await Message.findAll({
            where: { senderId: userId },
            attributes: ['receiverId'],
            group: ['receiverId']
        });
        
        const receivedMessages = await Message.findAll({
            where: { receiverId: userId },
            attributes: ['senderId'],
            group: ['senderId']
        });
        
        const conversationUserIds = [
            ...new Set([
                ...sentMessages.map(m => m.receiverId),
                ...receivedMessages.map(m => m.senderId)
            ])
        ];
        
        const conversations = await User.findAll({
            where: { id: { [Op.in]: conversationUserIds } },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });
        
        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (user) => {
                const lastMessage = await Message.findOne({
                    where: {
                        [Op.or]: [
                            { senderId: userId, receiverId: user.id },
                            { senderId: user.id, receiverId: userId }
                        ]
                    },
                    order: [['createdAt', 'DESC']]
                });
                
                const unreadCount = await Message.count({
                    where: {
                        senderId: user.id,
                        receiverId: userId,
                        isRead: false
                    }
                });
                
                return {
                    user,
                    lastMessage,
                    unreadCount
                };
            })
        );
        
        conversationsWithLastMessage.sort((a, b) => {
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });
        
        res.render('messaging/conversation', {
            title: `Conversation with ${conversationPartner.firstName} ${conversationPartner.lastName}`,
            conversations: conversationsWithLastMessage,
            messages,
            conversationPartner,
            userId,
            activeConversation: conversationId,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).send('Server error');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.session.user_id;
        const receiverId = req.params.conversationId;
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).send('Message content cannot be empty');
        }
        
        // Check if users are connected
        const isConnected = await Connection.findOne({
            where: {
                [Op.or]: [
                    { requesterId: senderId, receiverId, status: 'accepted' },
                    { requesterId: receiverId, receiverId: senderId, status: 'accepted' }
                ]
            }
        });
        
        // For now, skip connection check to allow messaging between any users
        // if (!isConnected) {
        //     return res.status(403).send('You need to be connected to message this user');
        // }
        
        // Create message
        await Message.create({
            senderId,
            receiverId,
            content
        });
        
        res.redirect(`/messaging/${receiverId}`);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};