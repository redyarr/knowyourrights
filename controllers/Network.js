const { User, Connection } = require('../models');
const { Op } = require('sequelize');

exports.getNetwork = async (req, res) => {
    try {
        const userId = req.session.user_id;
        
        // Get connections where the user is either the requester or receiver and status is accepted
        const connections = await Connection.findAll({
            where: {
                [Op.or]: [
                    { requesterId: userId },
                    { receiverId: userId }
                ],
                status: 'accepted'
            },
            include: [
                { 
                    model: User, 
                    as: 'Requester',
                    attributes: ['id', 'name', 'email', 'role'] 
                },
                { 
                    model: User, 
                    as: 'Receiver',
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        
        // Get pending connection requests sent to the user
        const pendingRequests = await Connection.findAll({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: [
                { 
                    model: User, 
                    as: 'Requester',
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        
        // Get users who are not connected to the current user
        // This is a simplified version - in a real app, you'd want pagination and more filtering
        const allUsers = await User.findAll({
            where: {
                id: {
                    [Op.ne]: userId
                }
            },
            attributes: ['id', 'name', 'email', 'role']
        });
        
        // Filter out users who are already connected or have pending requests
        const connectedUserIds = connections.map(conn => 
            conn.requesterId === userId ? conn.receiverId : conn.requesterId
        );
        
        const pendingUserIds = pendingRequests.map(req => req.requesterId);
        
        const sentPendingRequests = await Connection.findAll({
            where: {
                requesterId: userId,
                status: 'pending'
            },
            include: [
                { 
                    model: User, 
                    as: 'Receiver',
                    attributes: ['id', 'name', 'email', 'role'] 
                }
            ]
        });
        
        const sentPendingUserIds = sentPendingRequests.map(req => req.receiverId);
        
        const suggestedConnections = allUsers.filter(user => 
            !connectedUserIds.includes(user.id) && 
            !pendingUserIds.includes(user.id) &&
            !sentPendingUserIds.includes(user.id)
        );
        
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
        const existingConnection = await Connection.findOne({
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
        await Connection.create({
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
        
        const connection = await Connection.findOne({
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
        
        const connection = await Connection.findOne({
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
        
        const connection = await Connection.findOne({
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