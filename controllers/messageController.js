const { Message, User } = require('../models');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.session.user_id },
                    { receiverId: req.session.user_id }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['firstName', 'lastName'] },
                { model: User, as: 'receiver', attributes: ['firstName', 'lastName'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('messages/index', {
            title: 'Messages | Legal Network',
            messages,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        await Message.create({
            senderId: req.session.user_id,
            receiverId,
            content
        });
        res.redirect('/messages');
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: req.session.user_id, receiverId: id },
                    { senderId: id, receiverId: req.session.user_id }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['firstName', 'lastName'] },
                { model: User, as: 'receiver', attributes: ['firstName', 'lastName'] }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.render('messages/conversation', {
            title: 'Conversation | Legal Network',
            messages,
            user: req.session.user
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};