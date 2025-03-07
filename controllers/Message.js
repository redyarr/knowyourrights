const { Users, Connections } = require('../models');
const Message = require('../models/message');
const { Op } = require('sequelize');

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
        const conversations = await Users.findAll({
            where: { id: conversationUserIds },
            attributes: ['id', 'name', 'email']
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
        
        res.render('user/messages', {
            title: 'Messages',
            conversations: conversationsWithLastMessage,
            userId,
            activeConversation: null
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
        const isConnected = await Connections.findOne({
            where: {
                [Op.or]: [
                    { requesterId: userId, receiverId: conversationId, status: 'accepted' },
                    { requesterId: conversationId, receiverId: userId, status: 'accepted' }
                ]
            }
        });
        
        if (!isConnected) {
            return res.status(403).send('You need to be connected to message this user');
        }
        
        // Get conversation partner details
        const conversationPartner = await Users.findByPk(conversationId, {
            attributes: ['id', 'name', 'email']
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
        
        const conversations = await Users.findAll({
            where: { id: conversationUserIds },
            attributes: ['id', 'name', 'email']
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
        
        res.render('user/conversation', {
            title: `Conversation with ${conversationPartner.name}`,
            conversations: conversationsWithLastMessage,
            messages,
            conversationPartner,
            userId,
            activeConversation: conversationId
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).send('Server error');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.session.user_id;
        const { receiverId, content } = req.body;
        
        // Check if users are connected
        const isConnected = await Connections.findOne({
            where: {
                [Op.or]: [
                    { requesterId: senderId, receiverId, status: 'accepted' },
                    { requesterId: receiverId, receiverId: senderId, status: 'accepted' }
                ]
            }
        });
        
        if (!isConnected) {
            return res.status(403).send('You need to be connected to message this user');
        }
        
        // Create message
        await Message.create({
            senderId,
            receiverId,
            content
        });
        
        res.redirect(`/user/${senderId}/messages/${receiverId}`);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};