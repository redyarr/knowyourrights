const { User, Lawyer, ProfileImage } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../util/db');

// API endpoint for searching users (returns JSON)
exports.apiSearchUsers = async (req, res) => {
    try {
        const { query, searchType } = req.query;
        
        // Return empty results for short queries
        if (!query || query.trim().length < 2) {
            return res.json({ users: [] });
        }

        const trimmedQuery = query.trim();
        const searchResults = await performUserSearch(trimmedQuery, searchType);
        
        return res.json({ users: searchResults.allUsers });
    } catch (error) {
        console.error('API Search Error:', error);
        return res.status(500).json({ error: 'Search failed' });
    }
};

// Main search page
exports.searchUsers = async (req, res) => {
    try {
        const { query, searchType } = req.query;
        
        // Handle empty or short queries
        if (!query || query.trim().length < 2) {
            return res.render('search/results', { 
                lawyers: [],
                users: [], 
                query: query || '',
                searchType: searchType || 'all'
            });
        }

        const trimmedQuery = query.trim();
        const searchResults = await performUserSearch(trimmedQuery, searchType);
        
        // Get current user's connection information
        const currentUserId = req.session?.user_id;
        let connectionStatuses = {};
        
        if (currentUserId) {
            // Get all connections for the current user
            const { Connection } = require('../models');
            const connections = await Connection.findAll({
                where: {
                    [Op.or]: [
                        { requester_id: currentUserId },
                        { receiver_id: currentUserId }
                    ]
                }
            });
            
            // Build connection status map
            connections.forEach(conn => {
                const otherUserId = conn.requester_id === currentUserId ? conn.receiver_id : conn.requester_id;
                connectionStatuses[otherUserId] = conn.status;
            });
        }

        // Map lawyer results with proper formatting
        const mappedLawyers = searchResults.lawyers.map(user => {
            const lawyer = user.Lawyer || user.lawyer;
            
            // Authority level styling for lawyers
            let authorityColor = 'blue';
            let authorityBadge = 'LAWYER';
            let authorityIcon = '⚖️';
            
            if (lawyer && lawyer.badgeIssuingAuthority) {
                switch(lawyer.badgeIssuingAuthority) {
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
                profileImage: user.ProfileImage?.imagePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=64&background=3b82f6&color=ffffff`,
                summary: lawyer?.bio || 'Experienced legal professional',
                link: `/profile/${user.id}`,
                authorityColor,
                authorityBadge,
                authorityIcon,
                lawFirm: lawyer?.lawFirm || 'Independent Practice',
                specialization: lawyer?.specialization || 'General Practice',
                experience: lawyer?.experience || 'Experienced',
                connectionStatus: connectionStatuses[user.id] || null
            };
        });

        // Map user results with proper formatting
        const mappedUsers = searchResults.users.map(user => {
            return {
                id: user.id,
                title: `${user.firstName} ${user.lastName}`,
                profileImage: user.ProfileImage?.imagePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=64&background=6b7280&color=ffffff`,
                summary: user.interests || 'Community member interested in legal topics',
                link: `/profile/${user.id}`,
                connectionStatus: connectionStatuses[user.id] || null
            };
        });

        res.render('search/results', { 
            lawyers: mappedLawyers,
            users: mappedUsers, 
            query: trimmedQuery,
            searchType: searchType || 'all',
            currentUserId: currentUserId,
            loggedInUserId: currentUserId
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).render('error', { error: 'An error occurred while searching users' });
    }
};

// Core search function
async function performUserSearch(query, searchType = 'all') {
    const searchConditions = buildSearchConditions(query);
    
    let lawyers = [];
    let users = [];
    
    try {
        // Search lawyers if requested
        if (searchType === 'all' || searchType === 'lawyers') {
            lawyers = await User.findAll({
                where: {
                    [Op.and]: [
                        { [Op.or]: searchConditions },
                        { role: 'lawyer' }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                        required: false
                    },
                    {
                        model: Lawyer,
                        required: true
                    }
                ],
                limit: 20,
                order: [['firstName', 'ASC']]
            });
        }

        // Search regular users if requested
        if (searchType === 'all' || searchType === 'users') {
            users = await User.findAll({
                where: {
                    [Op.and]: [
                        { [Op.or]: searchConditions },
                        { role: { [Op.ne]: 'lawyer' } }
                    ]
                },
                include: [
                    {
                        model: ProfileImage,
                        attributes: ['imagePath'],
                        required: false
                    }
                ],
                limit: 20,
                order: [['firstName', 'ASC']]
            });
        }

        return {
            lawyers,
            users,
            allUsers: [...lawyers, ...users]
        };
    } catch (error) {
        console.error('Database search error:', error);
        throw error;
    }
}

// Build search conditions for flexible matching
function buildSearchConditions(query) {
    const conditions = [];
    const lowerQuery = query.toLowerCase();
    
    // Split query into individual terms for more flexible searching
    const searchTerms = lowerQuery.split(/\s+/).filter(term => term.length > 0);
    
    // Add individual field searches for each term (MySQL compatible)
    searchTerms.forEach(term => {
        const termPattern = `%${term}%`;
        conditions.push(
            sequelize.where(sequelize.fn('LOWER', sequelize.col('first_name')), { [Op.like]: termPattern }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('last_name')), { [Op.like]: termPattern }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), { [Op.like]: termPattern })
        );
    });
    
    // Add full query searches (MySQL compatible)
    const fullPattern = `%${lowerQuery}%`;
    conditions.push(
        sequelize.where(sequelize.fn('LOWER', sequelize.col('first_name')), { [Op.like]: fullPattern }),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('last_name')), { [Op.like]: fullPattern }),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), { [Op.like]: fullPattern })
    );
    
    // Add concatenated name search using MySQL CONCAT function
    try {
        conditions.push(
            sequelize.where(
                sequelize.fn('LOWER', 
                    sequelize.fn('CONCAT', 
                        sequelize.col('first_name'), 
                        ' ', 
                        sequelize.col('last_name')
                    )
                ),
                { [Op.like]: fullPattern }
            )
        );
    } catch (error) {
        console.warn('CONCAT search not supported, skipping:', error.message);
    }
    
    return conditions;
}

// Search lawyers by specialty
exports.searchLawyersBySpecialty = async (req, res) => {
    try {
        const { specialty } = req.query;
        const userId = req.session?.user_id;
        
        if (!specialty || specialty.trim().length === 0) {
            return res.render('search/results', {
                results: [],
                query: '',
                loggedInUserId: userId,
                path: req.path
            });
        }

        const trimmedSpecialty = specialty.trim();
        
        const lawyers = await User.findAll({
            where: {
                role: 'lawyer'
            },
            include: [
                {
                    model: Lawyer,
                    required: true,
                    where: {
                        legalAreas: {
                            [Op.iLike]: `%${trimmedSpecialty}%`
                        }
                    }
                },
                {
                    model: ProfileImage,
                    attributes: ['imagePath'],
                    required: false
                }
            ],
            order: [['firstName', 'ASC']]
        });

        // Map lawyers to a generic result format for the template
        const results = lawyers.map(user => {
            const lawyer = user.Lawyer || user.lawyer;
            return {
                title: `${user.firstName} ${user.lastName}`,
                summary: `Lawyer at ${lawyer?.lawFirm || 'Law Firm'} - Specializes in ${trimmedSpecialty}`,
                link: `/in/${user.id}`,
                specialty: lawyer?.legalAreas || ''
            };
        });

        return res.render('search/results', {
            results,
            query: `${trimmedSpecialty} lawyers`,
            loggedInUserId: userId,
            path: req.path
        });
    } catch (error) {
        console.error('Specialty search error:', error);
        return res.status(500).render('error', { error: 'An error occurred while searching lawyers' });
    }
};