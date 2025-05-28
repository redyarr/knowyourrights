const { Job, JobApply, User, Lawyer } = require('../models');

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

// Get job creation form
exports.getCreateJob = (req, res) => {
    res.render('job/create', {
        title: 'Create Job | Legal Network',
        user: req.session.user,
        error: null
    });
};

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { summary, country, city } = req.body;

        if (!summary || !country || !city) {
            return res.render('job/create', {
                title: 'Create Job | Legal Network',
                user: req.session.user,
                error: "All fields are required."
            });
        }

        const job = await Job.create({
            authorId: userId,
            summary,
            country,
            city,
            createdAt: new Date()
        });

        res.redirect('/jobs');
    } catch (error) {
        console.error('Error creating job:', error);
        res.render('job/create', {
            title: 'Create Job | Legal Network',
            user: req.session.user,
            error: error.message
        });
    }
};

// Get job details with applicants
exports.getJobDetails = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;

        // Fetch job with author details
        const job = await Job.findByPk(jobId, {
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });

        if (!job) {
            return res.status(404).render('error', { error: "Job not found" });
        }

        // Check if current user is the job author
        const isAuthor = job.authorId === userId;

        // Fetch applicants if user is the author
        let applicants = [];
        if (isAuthor) {
            applicants = await JobApply.findAll({
                where: { jobId },
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [{
                        model: Lawyer,
                        attributes: ['id', 'lawFirm', 'licenseNumber', 'summary']
                    }]
                }]
            });
        }

        // Check if current user (if lawyer) has already applied
        let hasApplied = false;
        if (req.session.user && req.session.user.role === 'lawyer') {
            const application = await JobApply.findOne({
                where: {
                    jobId,
                    userId
                }
            });
            hasApplied = !!application;
        }

        res.render('job/details', {
            title: 'Job Details | Legal Network',
            job,
            isAuthor,
            applicants,
            hasApplied,
            user: req.session.user
        });
    } catch (error) {
        console.error("Error fetching job details:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while fetching job details." });
    }
};

// Apply for a job (for lawyers)
exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;
        const { message } = req.body;

        // Verify user is a lawyer
        if (req.session.user.role !== 'lawyer') {
            return res.status(403).render('error', { error: "Only lawyers can apply for jobs" });
        }

        // Check if job exists
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).render('error', { error: "Job not found" });
        }

        // Check if already applied
        const existingApplication = await JobApply.findOne({
            where: {
                jobId,
                userId
            }
        });

        if (existingApplication) {
            return res.status(400).render('error', { error: "You have already applied for this job" });
        }

        // Create application
        await JobApply.create({
            userId,
            jobId,
            message,
            status: 'pending',
            createdAt: new Date()
        });

        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while applying for the job." });
    }
};

// Accept a lawyer for a job (for job authors)
exports.acceptLawyer = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const userId = req.session.user.id;

        // Verify job exists and user is the author
        const job = await Job.findByPk(jobId);
        if (!job) {
            return res.status(404).render('error', { error: "Job not found" });
        }

        if (job.authorId !== userId) {
            return res.status(403).render('error', { error: "You are not authorized to accept applications for this job" });
        }

        // Find the application
        const application = await JobApply.findByPk(applicationId);
        if (!application || application.jobId != jobId) {
            return res.status(404).render('error', { error: "Application not found" });
        }

        // Update application status
        await application.update({ status: 'accepted' });

        // Reject all other applications for this job
        await JobApply.update(
            { status: 'rejected' },
            {
                where: {
                    jobId,
                    id: { [sequelize.Op.ne]: applicationId }
                }
            }
        );

        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error("Error accepting lawyer:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while accepting the lawyer." });
    }
};