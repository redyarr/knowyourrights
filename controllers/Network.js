const { Users, Connections } = require('../models');
const { Op } = require('sequelize');

exports.getNetwork = async (req, res) => {
    if(req.session.user_id){
        console.log('We have session to network:', req.session.user_id);
    } else {
        console.log("No session found");
    }
    try {
        const userId = req.session.user_id;

        // Get accepted connections where the user is either the requester or receiver
        const connections = await Connections.findAll({
            where: {
                [Op.or]: [
                    { requesterId: userId },
                    { receiverId: userId }
                ],
                status: 'accepted'
            },
            include: [
                { 
                    model: Users, 
                    as: 'Requester', // Matches `index.js`
                    attributes: ['id', 'name', 'email', 'role'] 
                },
                { 
                    model: Users, 
                    as: 'Receiver', // Matches `index.js`
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        console.log('Connections:', connections);
        
        // Get pending connection requests sent to the user
        const pendingRequests = await Connections.findAll({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: [
                { 
                    model: Users, 
                    as: 'Requester', // Matches `index.js`
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        console.log('Pending Requests:', pendingRequests);
        
        // Get users who are not connected to the current user
        const allUsers = await Users.findAll({
            where: {
                id: {
                    [Op.ne]: userId
                }
            },
            attributes: ['id', 'name', 'email', 'role']
        });
        console.log('All Users:', allUsers);
        
        // Filter out users who are already connected or have pending requests
        const connectedUserIds = connections.map(conn => 
            conn.requesterId === userId ? conn.receiverId : conn.requesterId
        );
        console.log('Connected User IDs:', connectedUserIds);
        
        const pendingUserIds = pendingRequests.map(req => req.requesterId);
        console.log('Pending User IDs:', pendingUserIds);
        
        const sentPendingRequests = await Connections.findAll({
            where: {
                requesterId: userId,
                status: 'pending'
            },
            include: [
                { 
                    model: Users, 
                    as: 'Receiver', // Matches `index.js`
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        console.log('Sent Pending Requests:', sentPendingRequests);
        
        const sentPendingUserIds = sentPendingRequests.map(req => req.receiverId);
        console.log('Sent Pending User IDs:', sentPendingUserIds);
        
        const suggestedConnections = allUsers.filter(user => 
            !connectedUserIds.includes(user.id) && 
            !pendingUserIds.includes(user.id) &&
            !sentPendingUserIds.includes(user.id)
        );
        console.log('Suggested Connections:', suggestedConnections);
        
        res.render('user/network', {
            title: 'My Network',
            connections,
            pendingRequests,
            sentPendingRequests,
            suggestedConnections,
            userId
        });
    } catch (error) {
        console.error('Error fetching network:', error);
        res.status(500).send('Server error');
    }
};


exports.sendConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.session.user_id;
        const receiverId = req.params.id;
        
        // Check if a connection already exists
        const existingConnection = await Connections.findOne({
            where: {
                [Op.or]: [
                    { requesterId, receiverId },
                    { requesterId: receiverId, receiverId: requesterId }
                ]
            }
        });
        
        if (existingConnection) {
            return res.status(400).send('Connection request already exists');
        }
        
        // Create new connection request
        await Connections.create({
            requesterId,
            receiverId,
            status: 'pending'
        });
        
        res.redirect('/user/network');
    } catch (error) {
        console.error('Error sending connection request:', error);
        res.status(500).send('Server error');
    }
};

exports.acceptConnectionRequest = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.id;
        
        const connection = await Connections.findOne({
            where: {
                id: connectionId,
                receiverId: userId,
                status: 'pending'
            }
        });
        
        if (!connection) {
            return res.status(404).send('Connection request not found');
        }
        
        await connection.update({ status: 'accepted' });
        
        res.redirect('/user/network');
    } catch (error) {
        console.error('Error accepting connection request:', error);
        res.status(500).send('Server error');
    }
};

exports.rejectConnectionRequest = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.id;
        
        const connection = await Connections.findOne({
            where: {
                id: connectionId,
                receiverId: userId,
                status: 'pending'
            }
        });
        
        if (!connection) {
            return res.status(404).send('Connection request not found');
        }
        
        await connection.update({ status: 'rejected' });
        
        res.redirect('/user/network');
    } catch (error) {
        console.error('Error rejecting connection request:', error);
        res.status(500).send('Server error');
    }
};

exports.removeConnection = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const connectionId = req.params.id;
        
        const connection = await Connections.findOne({
            where: {
                id: connectionId,
                [Op.or]: [
                    { requesterId: userId },
                    { receiverId: userId }
                ],
                status: 'accepted'
            }
        });
        
        if (!connection) {
            return res.status(404).send('Connection not found');
        }
        
        await connection.destroy();
        
        res.redirect('/user/network');
    } catch (error) {
        console.error('Error removing connection:', error);
        res.status(500).send('Server error');
    }
};