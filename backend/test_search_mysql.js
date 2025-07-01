const { sequelize } = require('./util/db');
const { Op } = require('sequelize');
const User = require('./models/user');

// Test the MySQL-compatible search function
async function testSearch() {
    try {
        console.log('Testing MySQL-compatible search...');
        
        const query = 're';
        const lowerQuery = query.toLowerCase();
        const fullPattern = `%${lowerQuery}%`;
        
        // Test basic LIKE search
        console.log('\n1. Testing basic LIKE search:');
        const basicResults = await User.findAll({
            where: {
                [Op.or]: [
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('first_name')), { [Op.like]: fullPattern }),
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('last_name')), { [Op.like]: fullPattern }),
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), { [Op.like]: fullPattern })
                ]
            },
            limit: 5
        });
        console.log(`Found ${basicResults.length} users with basic search`);
        
        // Test CONCAT search
        console.log('\n2. Testing CONCAT search:');
        const concatResults = await User.findAll({
            where: {
                [Op.or]: [
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
                ]
            },
            limit: 5
        });
        console.log(`Found ${concatResults.length} users with CONCAT search`);
        
        console.log('\nAll tests passed!');
        
    } catch (error) {
        console.error('Error during search test:', error);
        console.error('Error stack:', error.stack);
    } finally {
        await sequelize.close();
    }
}

testSearch();