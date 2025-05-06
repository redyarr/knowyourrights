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
        console.log('=== Start of getMessages ===');
        
        const userId = req.session.user_id;
        console.log('1. User ID:', userId);
        
        // Get all conversations (unique users the current user has exchanged messages with)
        console.log('2. Fetching sent messages...');
        const sentMessages = await Message.findAll({
            where: { senderId: userId },
            attributes: ['receiverId'],
            group: ['receiverId']
        });
        console.log('3. Sent messages result:', JSON.stringify(sentMessages, null, 2));
        
        console.log('4. Fetching received messages...');
        const receivedMessages = await Message.findAll({
            where: { receiverId: userId },
            attributes: ['senderId'],
            group: ['senderId']
        });
        console.log('5. Received messages result:', JSON.stringify(receivedMessages, null, 2));
        
        // Combine unique user IDs from sent and received messages
        console.log('6. Combining user IDs...');
        const conversationUserIds = [
            ...new Set([
                ...sentMessages.map(m => m.receiverId),
                ...receivedMessages.map(m => m.senderId)
            ])
        ];
        console.log('7. Combined unique user IDs:', conversationUserIds);
        
        // Get user details for each conversation
        console.log('8. Fetching user details...');
        const conversations = await User.findAll({
            where: { id: { [Op.in]: conversationUserIds } },
            attributes: ['id', 'firstName', 'lastName', 'email']
        });
        console.log('9. User details retrieved:', JSON.stringify(conversations, null, 2));
        
        // Get the latest message for each conversation
        console.log('10. Getting latest messages for each conversation...');
        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (user) => {
                console.log(`11. Processing user ${user.id}...`);
                const lastMessage = await Message.findOne({
                    where: {
                        [Op.or]: [
                            { senderId: userId, receiverId: user.id },
                            { senderId: user.id, receiverId: userId }
                        ]
                    },
                    order: [['createdAt', 'DESC']]
                });
                console.log(`12. Last message for user ${user.id}:`, JSON.stringify(lastMessage, null, 2));
                
                // Count unread messages
                const unreadCount = await Message.count({
                    where: {
                        senderId: user.id,
                        receiverId: userId,
                        isRead: false
                    }
                });
                console.log(`13. Unread count for user ${user.id}:`, unreadCount);
                
                return {
                    user,
                    lastMessage,
                    unreadCount
                };
            })
        );
        
        // Sort conversations by the latest message
        console.log('14. Sorting conversations...');
        conversationsWithLastMessage.sort((a, b) => {
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });
        console.log('15. Final sorted conversations:', JSON.stringify(conversationsWithLastMessage, null, 2));
        
        console.log('16. Rendering view...');
        res.render('messaging/index', {
            title: 'Messages',
            messages: conversationsWithLastMessage,
            userId,
            activeConversation: null,
            user: req.session.user
        });
        console.log('=== End of getMessages ===');
    } catch (error) {
        console.error('=== Error in getMessages ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
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
                    { requester_id: userId, receiver_id: conversationId, status: 'accepted' },
                    { requester_id: conversationId, receiver_id: userId, status: 'accepted' }
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
        console.log('=== Start of sendMessage ===');
        
        console.log('1. Getting user IDs and message content');
        const senderId = req.session.user_id;
        const receiverId = req.params.conversationId;
        const { content } = req.body;
        
        console.log('2. Sender ID:', senderId);
        console.log('3. Receiver ID:', receiverId);
        console.log('4. Message content:', content);
        
        if (!content || content.trim() === '') {
            console.log('5. Error: Empty message content');
            return res.status(400).send('Message content cannot be empty');
        }
        
        console.log('6. Checking connection between users');
        // Check if users are connected
        const isConnected = await Connection.findOne({
            where: {
                [Op.or]: [
                    { requester_id: senderId, receiver_id: receiverId, status: 'accepted' },
                    { requester_id: receiverId, receiver_id: senderId, status: 'accepted' }
                ]
            }
        });
        console.log('7. Connection status:', isConnected);
        
        // For now, skip connection check to allow messaging between any users
        // if (!isConnected) {
        //     return res.status(403).send('You need to be connected to message this user');
        // }
        
        console.log('8. Creating new message');
        // Create message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });
        console.log('9. New message created:', JSON.stringify(newMessage, null, 2));
        
        console.log('10. Redirecting to conversation');
        res.redirect(`/messaging/${receiverId}`);
        
        console.log('=== End of sendMessage ===');
    } catch (error) {
        console.error('=== Error in sendMessage ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).send('Server error');
    }
};