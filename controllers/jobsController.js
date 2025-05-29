const { Job, JobApply, User, Lawyer, Notification, UserNotification, Message, ProfileImage } = require('../models');
const { Op } = require('sequelize');

exports.getJobs = async (req, res) => {
    try {
        // Fetch all available jobs with author details
        const jobs = await Job.findAll({
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName'],
                include: [{
                    model: ProfileImage,
                    attributes: ['imagePath']
                }]
            }],
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
                attributes: ['id', 'firstName', 'lastName'],
                include: [{
                    model: ProfileImage,
                    attributes: ['imagePath']
                }]
            }]
        });

        if (!job) {
            return res.status(404).render('error', { error: "Job not found" });
        }

        // Check if current user is the job author
        const isAuthor = job.authorId === userId;

        // Fetch applicants if user is the author
        let applicants = [];
        // In the getJobDetails function around line 95
        if (isAuthor) {
            applicants = await JobApply.findAll({
                where: { jobId },
                include: [{
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [{
                        model: Lawyer,
                        attributes: ['id', 'lawFirm', 'badgeNumber', 'badgeIssuingAuthority', 'summary']
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

        // Find the application with user details
        const application = await JobApply.findByPk(applicationId, {
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }]
        });
        if (!application || application.jobId != jobId) {
            return res.status(404).render('error', { error: "Application not found" });
        }

        // Get client details
        const client = await User.findByPk(userId, {
            attributes: ['firstName', 'lastName']
        });

        // Update application status
        await application.update({ status: 'accepted' });

        // Reject all other applications for this job
        await JobApply.update(
            { status: 'rejected' },
            {
                where: {
                    jobId,
                    id: { [Op.ne]: applicationId }
                }
            }
        );

        // Create notification for the accepted lawyer
        const notification = await Notification.create({
            userId: application.userId,
            title: 'Job Application Accepted!',
            message: `Congratulations! Your application for "${job.summary}" has been accepted by ${client.firstName} ${client.lastName}. They have sent you a message to get started.`
        });

        await UserNotification.create({
            userId: application.userId,
            notification_id: notification.id,
            isRead: false
        });

        // Create initial message from client to lawyer
        await Message.create({
            senderId: userId, // Client ID
            receiverId: application.userId, // Lawyer ID
            content: `Hello ${application.user.firstName}! I'm pleased to inform you that I've accepted your application for my job posting: "${job.summary}". I'm looking forward to working with you. Please let me know when you're available to discuss the details further.`,
            isRead: false
        });

        res.redirect(`/jobs/${jobId}`);
    } catch (error) {
        console.error("Error accepting lawyer:", error);
        res.status(500).render('error', { error: "An unexpected error occurred while accepting the lawyer." });
    }
};

// Delete a job (only by the author)
exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;

        // Find the job
        const job = await Job.findByPk(jobId);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        // Check if the current user is the author of the job
        if (job.authorId !== userId) {
            return res.status(403).json({ error: 'You can only delete your own jobs' });
        }

        // Delete all related job applications first
        await JobApply.destroy({
            where: { jobId: jobId }
        });

        // Delete the job
        await job.destroy();

        res.redirect('/jobs?deleted=true');
    } catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'An error occurred while deleting the job' });
    }
};