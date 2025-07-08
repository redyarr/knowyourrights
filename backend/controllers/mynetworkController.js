const { User, Connection, ProfileImage, Lawyer, Notification, UserNotification } = require('../models');
const { Op } = require('sequelize');

exports.getNetwork = async (req, res) => {
    console.log("step 1: Entered getNetwork function");
    try {
        const userId = req.session?.user_id;
        console.log("step 2: Retrieved userId from session:", userId);

        if (!userId) {
            console.error("Error: User ID is missing in session.");
            return res.status(400).render('error', { error: "Invalid session. Please log in again." });
        }

        console.log("step 3: Fetching connection requests sent to the user");
        const connectionRequests = await Connection.findAll({
            where: {
                receiver_id: userId,
                status: 'pending',
            },
            include: [
                {
                    model: User,
                    as: 'requester', // The user who sent the request
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [
                        {
                            model: ProfileImage,
                            attributes: ['imagePath'],
                        },
                        {
                            model: Lawyer,
                            required: false
                        }
                    ],
                },
            ],
        });
        console.log("step 4: Fetched connection requests:", connectionRequests);

        console.log("step 5: Fetching pending requests sent by the user");
        const pendingRequests = await Connection.findAll({
            where: {
                requester_id: userId,
                status: 'pending',
            },
            include: [
                {
                    model: User,
                    as: 'receiver', // The user who received the request
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [
                        {
                            model: ProfileImage,
                            attributes: ['imagePath'],
                        },
                        {
                            model: Lawyer,
                            required: false
                        }
                    ],
                },
            ],
        });
        console.log("step 6: Fetched pending requests:", pendingRequests);

        console.log("step 7: Fetching accepted friends");
        const friends = await Connection.findAll({
            where: {
                [Op.or]: [
                    { requester_id: userId, status: 'accepted' },
                    { receiver_id: userId, status: 'accepted' },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'connectedUser', // The other user in the connection
                    attributes: ['id', 'firstName', 'lastName', 'role'],
                    include: [
                        {
                            model: ProfileImage,
                            attributes: ['imagePath'],
                        },
                        {
                            model: Lawyer,
                            required: false
                        }
                    ],
                },
            ],
        });
        console.log("step 8: Fetched friends:", friends);
        
        // Fetch lawyers who are not yet connected with the user
        const connectedUserIds = [
            ...friends.map(f => f.requester_id === userId ? f.receiver_id : f.requester_id),
            ...connectionRequests.map(r => r.requester_id),
            ...pendingRequests.map(r => r.receiver_id)
        ];
        
        // Add current user to exclude list
        connectedUserIds.push(userId);
        
        const suggestedLawyers = await User.findAll({
            where: {
                role: 'lawyer',
                id: { [Op.notIn]: connectedUserIds }
            },
            include: [
                {
                    model: Lawyer,
                },
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                }
            ],
            limit: 5
        });

        console.log("step 9: Rendering mynetwork/index view");
        res.render('mynetwork/index', {
            title: 'My Network | Legal Network',
            connectionRequests: connectionRequests, // Pass connection requests
            pendingRequests: pendingRequests, // Pass pending requests sent by user
            friends: friends, // Pass accepted friends
            suggestedLawyers: suggestedLawyers, // Pass suggested lawyers
            user: req.session.user,
        });
        console.log("step 10: Rendered mynetwork/index successfully");
    } catch (error) {
        console.error("Error fetching network:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while fetching your network." });
    }
};

// Send a connection request
exports.sendConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.session.user_id;
        const receiverId = req.params.userId;
        
        // Check if users exist
        const [requester, receiver] = await Promise.all([
            User.findByPk(requesterId),
            User.findByPk(receiverId)
        ]);
        
        if (!requester || !receiver) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if a connection already exists
        const existingConnection = await Connection.findOne({
            where: {
                [Op.or]: [
                    { requester_id: requesterId, receiver_id: receiverId },
                    { requester_id: receiverId, receiver_id: requesterId }
                ]
            }
        });
        
        if (existingConnection) {
            return res.status(400).json({ 
                success: false, 
                message: 'A connection request already exists between these users' 
            });
        }
        
        // Create the connection request
        const connection = await Connection.create({
            requester_id: requesterId,
            receiver_id: receiverId,
            status: 'pending',
            created_at: new Date()
        });
        
        // Create a notification for the receiver
        const notification = await Notification.create({
            userId: receiverId,
            title: 'New Connection Request',
            message: `${requester.firstName} ${requester.lastName} wants to connect with you.`
        });
        
        await UserNotification.create({
            userId: receiverId,
            notification_id: notification.id,
            isRead: false
        });
        
        return res.status(200).json({ 
            success: true, 
            message: 'Connection request sent successfully',
            connectionId: connection.id 
        });
    } catch (error) {
        console.error('Error sending connection request:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while sending the request' });
    }
};

// Accept a connection request
exports.acceptConnectionRequest = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.connectionId;
        
        // Find the connection request
        const connection = await Connection.findOne({
            where: {
                id: connectionId,
                receiver_id: userId,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'requester',
                attributes: ['id', 'firstName', 'lastName']
            }]
        });
        
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found' });
        }
        
        // Update the connection status
        connection.status = 'accepted';
        await connection.save();
        
        // Create a notification for the requester
        const notification = await Notification.create({
            userId: connection.requester_id,
            title: 'Connection Request Accepted',
            message: `Your connection request to ${req.session.user.firstName} ${req.session.user.lastName} has been accepted.`
        });
        
        await UserNotification.create({
            userId: connection.requester_id,
            notification_id: notification.id,
            isRead: false
        });
        
        return res.status(200).json({ success: true, message: 'Connection request accepted' });
    } catch (error) {
        console.error('Error accepting connection request:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while accepting the request' });
    }
};

// Decline a connection request
exports.declineConnectionRequest = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.connectionId;
        
        // Find the connection request
        const connection = await Connection.findOne({
            where: {
                id: connectionId,
                receiver_id: userId,
                status: 'pending'
            }
        });
        
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found' });
        }
        
        // Delete the connection request
        await connection.destroy();
        
        return res.status(200).json({ success: true, message: 'Connection request declined' });
    } catch (error) {
        console.error('Error declining connection request:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while declining the request' });
    }
};

// Cancel a connection request (sent by the user)
exports.cancelConnectionRequest = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.connectionId;
        
        // Find the connection request sent by the user
        const connection = await Connection.findOne({
            where: {
                id: connectionId,
                requester_id: userId,
                status: 'pending'
            }
        });
        
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found' });
        }
        
        // Delete the connection request
        await connection.destroy();
        
        return res.status(200).json({ success: true, message: 'Connection request cancelled' });
    } catch (error) {
        console.error('Error cancelling connection request:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while cancelling the request' });
    }
};

// Get suggested lawyers for the feed page
exports.getSuggestedLawyers = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        
        // Get existing connections and pending requests
        const connections = await Connection.findAll({
            where: {
                [Op.or]: [
                    { requester_id: userId },
                    { receiver_id: userId }
                ]
            }
        });
        
        // Extract connected user IDs and create a map for status tracking
        const connectionMap = new Map();
        connections.forEach(conn => {
            if (conn.requester_id === userId) {
                connectionMap.set(conn.receiver_id, {
                    status: conn.status,
                    connectionId: conn.id,
                    type: 'sent' // User sent the request
                });
            } else {
                connectionMap.set(conn.requester_id, {
                    status: conn.status,
                    connectionId: conn.id,
                    type: 'received' // User received the request
                });
            }
        });
        
        // Get connected user IDs to exclude from suggestions
        const connectedUserIds = connections
            .filter(conn => conn.status === 'accepted')
            .map(conn => conn.requester_id === userId ? conn.receiver_id : conn.requester_id);
        
        // Add current user to exclude list
        connectedUserIds.push(userId);
        
        // Find lawyers who are not already connected
        const suggestedLawyers = await User.findAll({
            where: {
                role: 'lawyer',
                id: { [Op.notIn]: connectedUserIds }
            },
            include: [
                {
                    model: Lawyer,
                },
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                }
            ],
            limit: 10
        });

        
        
        // Add connection status to each suggested lawyer
        const lawyersWithStatus = suggestedLawyers.map(lawyer => {
            const connection = connectionMap.get(lawyer.id);
            return {
                ...lawyer.toJSON(),
                connectionStatus: connection ? connection.status : null,
                connectionType: connection ? connection.type : null,
                connectionId: connection ? connection.connectionId : null
            };
        })

        return res.status(200).json({ 
            success: true, 
            lawyers: lawyersWithStatus
        });
    } catch (error) {
        console.error('Error fetching suggested lawyers:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while fetching suggested lawyers'
        });
    }
};