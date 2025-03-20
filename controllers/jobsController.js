const { Job } = require('../models');

exports.getJobs = async (req, res) => {
    try {
        // Fetch all available jobs
        const jobs = await Job.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.render('job/index', {
            title: 'Jobs | Legal Network',
            jobs,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while fetching jobs." });
    }
};