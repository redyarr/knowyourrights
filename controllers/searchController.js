const { User, ProfileImage, Lawyer } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');

// API endpoint for searching users (returns JSON)
exports.apiSearchUsers = async (req, res) => {
    try {
        const { query, searchType } = req.query;
        if (!query || query.length < 2) {
            return res.json({ users: [] });
        }
        
        // Create flexible search patterns
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const searchConditions = [];
        
        // Add exact and partial matches for each search term
        searchTerms.forEach(term => {
            searchConditions.push(
                { first_name: { [Op.like]: `%${term}%` } },
                { last_name: { [Op.like]: `%${term}%` } },
                { email: { [Op.like]: `%${term}%` } }
            );
        });
        
        // Also add full query search
        searchConditions.push(
            { first_name: { [Op.like]: `%${query}%` } },
            { last_name: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
            // Add concatenated name search
            sequelize.where(
                sequelize.fn('CONCAT', sequelize.col('first_name'), ' ', sequelize.col('last_name')),
                { [Op.like]: `%${query}%` }
            )
        );
        
        let lawyers = [];
        let regularUsers = [];
        
        // Search based on type
        if (!searchType || searchType === 'all' || searchType === 'lawyers') {
            lawyers = await User.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: searchConditions
                        },
                        { role: 'lawyer' }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                    },
                    {
                        model: Lawyer,
                        required: true
                    }
                ],
                limit: 7
            });
        }

        if (!searchType || searchType === 'all' || searchType === 'users') {
            regularUsers = await User.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: searchConditions
                        },
                        { role: { [Op.ne]: 'lawyer' } }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                    }
                ],
                limit: 7
            });
        }

        // Combine results with lawyers first
        const users = [...lawyers, ...regularUsers];
        
        return res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ error: 'An error occurred while searching users' });
    }
};

// Main search page
exports.searchUsers = async (req, res) => {
    try {
        const { query, searchType } = req.query;
        
        if (!query || query.length < 2) {
            return res.render('search/results', { 
                lawyers: [],
                users: [], 
                query: query || '',
                searchType: searchType || 'all'
            });
        }

        let lawyers = [];
        let regularUsers = [];

        // Create flexible search patterns
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const searchConditions = [];
        
        // Add exact and partial matches for each search term
        searchTerms.forEach(term => {
            searchConditions.push(
                { first_name: { [Op.like]: `%${term}%` } },
                { last_name: { [Op.like]: `%${term}%` } },
                { email: { [Op.like]: `%${term}%` } }
            );
        });
        
        // Also add full query search
        searchConditions.push(
            { first_name: { [Op.like]: `%${query}%` } },
            { last_name: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } },
            // Add concatenated name search
            sequelize.where(
                sequelize.fn('CONCAT', sequelize.col('first_name'), ' ', sequelize.col('last_name')),
                { [Op.like]: `%${query}%` }
            )
        );

        // Search based on type
        if (searchType === 'all' || searchType === 'lawyers') {
            lawyers = await User.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: searchConditions
                        },
                        { role: 'lawyer' }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                    },
                    {
                        model: Lawyer,
                        required: true
                    }
                ],
                limit: 20
            });
        }

        if (searchType === 'all' || searchType === 'users') {
            regularUsers = await User.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: searchConditions
                        },
                        { role: { [Op.ne]: 'lawyer' } }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                    }
                ],
                limit: 20
            });
        }

        // Map lawyer results
        const mappedLawyers = lawyers.map(user => {
            const isLawyer = user.role === 'lawyer' && user.lawyer;
            
            // Authority level styling for lawyers
            let authorityColor = 'blue';
            let authorityBadge = 'LAWYER';
            let authorityIcon = '⚖️';
            
            if (isLawyer && user.lawyer.badgeIssuingAuthority) {
                switch(user.lawyer.badgeIssuingAuthority) {
                    case 'training':
                        authorityColor = 'yellow';
                        authorityBadge = 'TRAINING';
                        authorityIcon = '📚';
                        break;
                    case 'approved':
                        authorityColor = 'green';
                        authorityBadge = 'APPROVED';
                        authorityIcon = '✅';
                        break;
                    case 'consultant':
                        authorityColor = 'purple';
                        authorityBadge = 'CONSULTANT';
                        authorityIcon = '👨‍💼';
                        break;
                }
            }

            return {
                id: user.id,
                title: `${user.firstName} ${user.lastName}`,
                summary: `Lawyer at ${user.lawyer?.lawFirm || 'Law Firm'}`,
                link: `/in/${user.id}`,
                profileImage: user.ProfileImage?.imagePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`,
                isLawyer: true,
                authorityColor,
                authorityBadge,
                authorityIcon
            };
        });

        // Map regular user results
        const mappedUsers = regularUsers.map(user => {
            return {
                id: user.id,
                title: `${user.firstName} ${user.lastName}`,
                summary: 'User',
                link: `/in/${user.id}`,
                profileImage: user.ProfileImage?.imagePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`,
                isLawyer: false
            };
        });

        res.render('search/results', { 
            lawyers: mappedLawyers,
            users: mappedUsers, 
            query,
            searchType: searchType || 'all'
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).render('error', { error: 'An error occurred while searching users' });
    }
};

// Search lawyers by specialty
exports.searchLawyersBySpecialty = async (req, res) => {
    try {
        const { specialty } = req.query;
        const userId = req.session?.user_id;
        
        if (!specialty) {
            return res.render('search/results', {
                results: [],
                query: '',
                loggedInUserId: userId,
                path: req.path
            });
        }

        const lawyers = await User.findAll({
            include: [
                {
                    model: Lawyer,
                    required: true,
                    where: {
                        legalAreas: {
                            [Op.like]: `%${specialty}%`
                        }
                    }
                },
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                    required: false
                }
            ]
        });

        // Map lawyers to a generic result format for the template
        const results = lawyers.map(user => ({
            title: user.firstName + ' ' + user.lastName,
            summary: `Lawyer at ${user.lawyer.lawFirm || 'Law Firm'} - Specializes in ${specialty}`,
            link: '/in/' + user.id,
            specialty: user.lawyer.legalAreas
        }));

        return res.render('search/results', {
            results,
            query: `${specialty} lawyers`,
            loggedInUserId: userId,
            path: req.path
        });
    } catch (error) {
        console.error('Error searching lawyers by specialty:', error);
        return res.status(500).render('error', { error: 'An error occurred while searching lawyers' });
    }
};