const express = require('express');
const router = express.Router();
const { Users, Blogs, Comments, Reacts, Notifications, Categories } = require('../models'); // Import Sequelize models
const bcrypt = require('bcrypt'); // Make sure to require bcrypt

// Seed database (runs only once)
async function seedDatabase() {
    try {
        console.log("Starting to seed database...");

        // Insert users
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password1', role: 'visitor' },
            { id: 2, name: 'Alice Smith', email: 'alice@example.com', password: 'password2', role: 'lawyer' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', password: 'password3', role: 'admin' },
            { id: 4, name: 'Emily Brown', email: 'emily@example.com', password: 'password4', role: 'visitor' },
            { id: 5, name: 'David Wilson', email: 'david@example.com', password: 'password5', role: 'lawyer' }
        ];

        for (let user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }

        console.log("Users prepared for insertion:", users);
        await Users.bulkCreate(users, { ignoreDuplicates: true });
        console.log("Users inserted successfully.");

        // Insert categories
        const categories = [
            { id: 1, name: 'Legal Advice', description: 'General legal advice and tips' },
            { id: 2, name: 'Lawyer Tips', description: 'Advice from professional lawyers' },
            { id: 3, name: 'Legal News', description: 'Latest updates in the legal world' }
        ];

        console.log("Categories prepared for insertion:", categories);
        await Categories.bulkCreate(categories, { ignoreDuplicates: true });
        console.log("Categories inserted successfully.");

        // Insert blogs
        const blogs = [
            { id: 1, title: 'Legal Rights Explained', content: 'Understanding legal rights...', category_id: 1, author_id: 2 },
            { id: 2, title: 'How to Hire a Lawyer', content: 'Tips for hiring a lawyer...', category_id: 2, author_id: 3 },
            { id: 3, title: 'New Legal Reforms', content: 'Latest updates in legal policies...', category_id: 3, author_id: 1 },
            { id: 4, title: 'Court Procedures Simplified', content: 'Step-by-step guide...', category_id: 1, author_id: 4 },
            { id: 5, title: 'Common Legal Myths', content: 'Debunking legal myths...', category_id: 2, author_id: 5 }
        ];

        console.log("Blogs prepared for insertion:", blogs);
        await Blogs.bulkCreate(blogs, { ignoreDuplicates: true });
        console.log("Blogs inserted successfully.");

        // Insert comments
        const comments = [
            { id: 1, post_id: 1, user_id: 3, content: 'Great insights! Thanks for sharing.' },
            { id: 2, post_id: 2, user_id: 1, content: 'Very helpful, appreciate the guidance.' },
            { id: 3, post_id: 3, user_id: 4, content: 'I didn’t know about this, thanks!' },
            { id: 4, post_id: 4, user_id: 5, content: 'Can you provide more details on this?' },
            { id: 5, post_id: 5, user_id: 2, content: 'Good points! Looking forward to more.' }
        ];

        console.log("Comments prepared for insertion:", comments);
        await Comments.bulkCreate(comments, { ignoreDuplicates: true });
        console.log("Comments inserted successfully.");

        // Insert reactions
        const reacts = [
            { id: 1, user_id: 1, blog_id: 1, reaction: 'like' },
            { id: 2, user_id: 2, blog_id: 2, reaction: 'love' },
            { id: 3, user_id: 3, blog_id: 3, reaction: 'haha' },
            { id: 4, user_id: 4, blog_id: 4, reaction: 'sad' },
            { id: 5, user_id: 5, blog_id: 5, reaction: 'angry' }
        ];

        console.log("Reacts prepared for insertion:", reacts);
        await Reacts.bulkCreate(reacts, { ignoreDuplicates: true });
        console.log("Reacts inserted successfully.");

        // Insert notifications
        const notifications = [
            { id: 1, title: 'Welcome!', message: 'Thank you for joining our platform.', isRead: false, userId: 1 },
            { id: 2, title: 'New Blog Posted', message: 'Check out our latest blog.', isRead: false, userId: 2 },
            { id: 3, title: 'Comment Replied', message: 'Someone replied to your comment.', isRead: true, userId: 3 },
            { id: 4, title: 'Legal Updates', message: 'Stay updated with new laws.', isRead: false, userId: 4 },
            { id: 5, title: 'Reminder', message: 'Don’t forget to check your messages.', isRead: true, userId: 5 }
        ];

        console.log("Notifications prepared for insertion:", notifications);
        await Notifications.bulkCreate(notifications, { ignoreDuplicates: true });
        console.log("Notifications inserted successfully.");

        console.log("Database seeded successfully.");
    } catch (err) {
        console.error("Seeding error:", err);
    }
}

// Route to fetch blogs and authors
router.get('/', async (req, res) => {
    try {
        console.log("Seeding database...");
        await seedDatabase(); // Run seeding inside the route
        res.redirect('/blog');
    } catch (err) {
        console.error("Seeding failed:", err);
        res.status(500).send("Error seeding database.");
    }
});

module.exports = router;
