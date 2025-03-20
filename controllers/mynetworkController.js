const { User, Connection, ProfileImage } = require('../models');
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
            // include: [
            //     {
            //         model: User,
            //         as: 'connectedUser', // Updated alias to match the one defined in the association
            //         attributes: ['id', 'firstName', 'lastName'],
            //         include: [
            //             {
            //                 model: ProfileImage,
            //                 attributes: ['imagePath'],
            //             },
            //         ],
            //     },
            // ],
        });
        console.log("step 4: Fetched connection requests:", connectionRequests);

        console.log("step 5: Fetching accepted friends");
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
                    as: 'connectedUser', // Assuming 'connectedUser' is the alias for the other user in the connection
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        {
                            model: ProfileImage,
                            attributes: ['imagePath'],
                        },
                    ],
                },
            ],
        });
        console.log("step 6: Fetched friends:", friends);

        console.log("step 7: Rendering mynetwork/index view");
        res.render('mynetwork/index', {
            title: 'My Network | Legal Network',
            connectionRequests: connectionRequests, // Pass connection requests
            friends: friends, // Pass accepted friends
            user: req.session.user,
        });
        console.log("step 8: Rendered mynetwork/index successfully");
    } catch (error) {
        console.error("Error fetching network:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while fetching your network." });
    }
};