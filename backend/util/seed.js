const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Import models from the models directory
const {
  User,
  Lawyer,
  Category,
  Comment,
  Connection,
  Contact,
  Education,
  LawyerEducation,
  Message,
  Notification,
  Photo,
  Post,
  PostCategory,
  PostPhoto,
  ProfileImage,
  React,
  Share,
  UserNotification,
  JobApply,
  PostReport,
  UserReport,
  Job,
  JobReport,
  lawyerDoc
} = require('../models');

/**
 * Seed the database with initial data.
 * Each table is seeded with 12 rows.
 */
async function seedDatabase() {
  try {
    console.log("Starting to seed database...");

    // --- 1. Seed Educations (no FK dependencies) ---
    const educations = [
      { id: 1, university: 'Harvard University', college: 'Harvard College', department: 'Computer Science', degree: 'Bachelor' },
      { id: 2, university: 'Stanford University', college: 'Stanford College', department: 'Engineering', degree: 'Master' },
      { id: 3, university: 'MIT', college: 'MIT College', department: 'Physics', degree: 'PhD' },
      { id: 4, university: 'University of Oxford', college: 'Oxford College', department: 'Philosophy', degree: 'Bachelor' },
      { id: 5, university: 'University of Cambridge', college: 'Cambridge College', department: 'Mathematics', degree: 'Master' },
      { id: 6, university: 'Yale University', college: 'Yale College', department: 'Economics', degree: 'Bachelor' },
      { id: 7, university: 'Princeton University', college: 'Princeton College', department: 'History', degree: 'Master' },
      { id: 8, university: 'Columbia University', college: 'Columbia College', department: 'Political Science', degree: 'Bachelor' },
      { id: 9, university: 'University of Chicago', college: 'Chicago College', department: 'Sociology', degree: 'Master' },
      { id: 10, university: 'Caltech', college: 'Caltech College', department: 'Chemistry', degree: 'PhD' },
      { id: 11, university: 'University of Michigan', college: 'Michigan College', department: 'Biology', degree: 'Bachelor' },
      { id: 12, university: 'University of Texas', college: 'Texas College', department: 'Law', degree: 'Master' }
    ];
    await Education.bulkCreate(educations, { ignoreDuplicates: true });
    console.log("Educations inserted");

    // --- 2. Seed Users (no FK dependencies) ---
    let users = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password1', role: 'visitor', country: 'USA', city: 'New York', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', password: 'password2', role: 'lawyer', country: 'USA', city: 'Los Angeles', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', password: 'password3', role: 'admin', country: 'USA', city: 'Chicago', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', password: 'password4', role: 'visitor', country: 'Canada', city: 'Toronto', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', password: 'password5', role: 'lawyer', country: 'Canada', city: 'Vancouver', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, firstName: 'Dana', lastName: 'Miller', email: 'dana.miller@example.com', password: 'password6', role: 'admin', country: 'UK', city: 'London', createdAt: new Date(), updatedAt: new Date() },
      { id: 7, firstName: 'Evan', lastName: 'Wilson', email: 'evan.wilson@example.com', password: 'password7', role: 'visitor', country: 'UK', city: 'Manchester', createdAt: new Date(), updatedAt: new Date() },
      { id: 8, firstName: 'Fiona', lastName: 'Moore', email: 'fiona.moore@example.com', password: 'password8', role: 'lawyer', country: 'Australia', city: 'Sydney', createdAt: new Date(), updatedAt: new Date() },
      { id: 9, firstName: 'George', lastName: 'Taylor', email: 'george.taylor@example.com', password: 'password9', role: 'admin', country: 'Australia', city: 'Melbourne', createdAt: new Date(), updatedAt: new Date() },
      { id: 10, firstName: 'Hannah', lastName: 'Anderson', email: 'hannah.anderson@example.com', password: 'password10', role: 'visitor', country: 'Germany', city: 'Berlin', createdAt: new Date(), updatedAt: new Date() },
      { id: 11, firstName: 'Aland', lastName: 'Othman', email: 'aland@gmail.com', password: '123123', role: 'lawyer', country: 'France', city: 'Paris', createdAt: new Date(), updatedAt: new Date() },
      { id: 12, firstName: 'Redyar', lastName: 'Hawzhin', email: 'redyar@gmail.com', password: '123123', role: 'visitor', country: 'Spain', city: 'Madrid', createdAt: new Date(), updatedAt: new Date() }
    ];
    // Hash passwords for each user before insertion
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    await User.bulkCreate(users, { ignoreDuplicates: true });
    console.log("Users inserted");

    // --- 3. Seed UserReports (12 rows) ---
    const userReports = [
      { userId: 1, reporterId: 2, reportType: 'SPAM', createdAt: new Date() },
      { userId: 2, reporterId: 3, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 3, reporterId: 4, reportType: 'OTHER', createdAt: new Date() },
      { userId: 4, reporterId: 5, reportType: 'SPAM', createdAt: new Date() },
      { userId: 5, reporterId: 6, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 6, reporterId: 7, reportType: 'OTHER', createdAt: new Date() },
      { userId: 7, reporterId: 8, reportType: 'SPAM', createdAt: new Date() },
      { userId: 8, reporterId: 9, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 9, reporterId: 10, reportType: 'OTHER', createdAt: new Date() },
      { userId: 10, reporterId: 11, reportType: 'SPAM', createdAt: new Date() },
      { userId: 11, reporterId: 12, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 12, reporterId: 1, reportType: 'OTHER', createdAt: new Date() }
    ];
    await UserReport.bulkCreate(userReports, { ignoreDuplicates: true });
    console.log("UserReports inserted");

    // --- 4. Seed Lawyers (depends on Users, now 4 rows for users with lawyer role) ---
    const lawyers = [
      { userId: 2, lawFirm: 'Law Firm B', badgeNumber: 'LN1002', verificationStatus: "approved", badgeIssueDate: new Date('2019-03-22'), badgeIssuingAuthority: 'approved', summary: 'Expert in corporate law.' },
      { userId: 5, lawFirm: 'Law Firm E', badgeNumber: 'LN1005', badgeIssueDate: new Date('2020-09-18'), badgeIssuingAuthority: 'consultant', summary: 'Well-versed in intellectual property.' },
      { userId: 8, lawFirm: 'Law Firm H', badgeNumber: 'LN1008', badgeIssueDate: new Date('2021-12-03'), badgeIssuingAuthority: 'training', summary: 'Experienced in labor law.' },
      { userId: 11, lawFirm: 'Law Firm K', badgeNumber: 'LN1011', badgeIssueDate: new Date('2021-01-20'), badgeIssuingAuthority: 'consultant', summary: 'Expert in intellectual property disputes.' }
    ];
    await Lawyer.bulkCreate(lawyers, { ignoreDuplicates: true });
    console.log("Lawyers inserted");

    // --- 5. Seed LawyerEducations (depends on Lawyers and Educations, now 12 rows) ---
    const lawyerEducations = [
      { lawyerId: 1, educationId: 1 },
      { lawyerId: 2, educationId: 2 },
      { lawyerId: 3, educationId: 3 },
      { lawyerId: 4, educationId: 4 },
      { lawyerId: 5, educationId: 5 },
      { lawyerId: 6, educationId: 6 },
      { lawyerId: 7, educationId: 7 },
      { lawyerId: 8, educationId: 8 },
      { lawyerId: 9, educationId: 9 },
      { lawyerId: 10, educationId: 10 },
      { lawyerId: 11, educationId: 11 },
      { lawyerId: 12, educationId: 12 }
    ];
    await LawyerEducation.bulkCreate(lawyerEducations, { ignoreDuplicates: true });
    console.log("LawyerEducations inserted");

    // --- 6. Seed Categories (no FK dependencies, now 12 rows) ---
    const categories = [
      { id: 1, name: 'Technology', description: 'All tech-related topics' },
      { id: 2, name: 'Science', description: 'Scientific discoveries and news' },
      { id: 3, name: 'Health', description: 'Health and wellness advice' },
      { id: 4, name: 'Travel', description: 'Travel guides and tips' },
      { id: 5, name: 'Education', description: 'Educational resources and articles' },
      { id: 6, name: 'Entertainment', description: 'Movies, music, and more' },
      { id: 7, name: 'Sports', description: 'Latest sports news and events' },
      { id: 8, name: 'Food', description: 'Recipes and restaurant reviews' },
      { id: 9, name: 'Finance', description: 'Money management and investments' },
      { id: 10, name: 'Lifestyle', description: 'Fashion, home, and personal care' },
      { id: 11, name: 'Politics', description: 'Political discussions and news' },
      { id: 12, name: 'Environment', description: 'Environmental issues and conservation' }
    ];
    await Category.bulkCreate(categories, { ignoreDuplicates: true });
    console.log("Categories inserted");

    // --- 7. Seed Photos (no FK dependencies, now 12 rows) ---
    const photos = [
      { id: 1, photoPath: '/images/photo1.jpg' },
      { id: 2, photoPath: '/images/photo2.jpg' },
      { id: 3, photoPath: '/images/photo3.jpg' },
      { id: 4, photoPath: '/images/photo4.jpg' },
      { id: 5, photoPath: '/images/photo5.jpg' },
      { id: 6, photoPath: '/images/photo6.jpg' },
      { id: 7, photoPath: '/images/photo7.jpg' },
      { id: 8, photoPath: '/images/photo8.jpg' },
      { id: 9, photoPath: '/images/photo9.jpg' },
      { id: 10, photoPath: '/images/photo10.jpg' },
      { id: 11, photoPath: '/images/photo11.jpg' },
      { id: 12, photoPath: '/images/photo12.jpg' }
    ];
    await Photo.bulkCreate(photos, { ignoreDuplicates: true });
    console.log("Photos inserted");

    // --- 8. Seed Posts (depends on Users, now 12 rows) ---
    const posts = [
      { id: 1, authorId: 1, title: 'First Post', content: 'This is the content of the first post.', createdAt: new Date() },
      { id: 2, authorId: 2, title: 'Second Post', content: 'Content for the second post.', createdAt: new Date() },
      { id: 3, authorId: 3, title: 'Third Post', content: 'Here is what I have to say in post three.', createdAt: new Date() },
      { id: 4, authorId: 4, title: 'Fourth Post', content: 'Discussion on various topics in post four.', createdAt: new Date() },
      { id: 5, authorId: 5, title: 'Fifth Post', content: 'Insights and analysis in post five.', createdAt: new Date() },
      { id: 6, authorId: 6, title: 'Sixth Post', content: 'The sixth post content goes here.', createdAt: new Date() },
      { id: 7, authorId: 7, title: 'Seventh Post', content: 'Another interesting post number seven.', createdAt: new Date() },
      { id: 8, authorId: 8, title: 'Eighth Post', content: 'Post eight contains great insights.', createdAt: new Date() },
      { id: 9, authorId: 9, title: 'Ninth Post', content: 'Content for the ninth post is here.', createdAt: new Date() },
      { id: 10, authorId: 10, title: 'Tenth Post', content: 'Wrapping up with the tenth post content.', createdAt: new Date() },
      { id: 11, authorId: 11, title: 'Eleventh Post', content: 'Additional insights in the eleventh post.', createdAt: new Date() },
      { id: 12, authorId: 12, title: 'Twelfth Post', content: 'Final thoughts in the twelfth post.', createdAt: new Date() }
    ];
    await Post.bulkCreate(posts, { ignoreDuplicates: true });
    console.log("Posts inserted");

    // --- 9. Seed PostCategories (depends on Posts and Categories, now 12 rows) ---
    const postCategories = [
      { post_id: 1, category_id: 2 },
      { post_id: 2, category_id: 3 },
      { post_id: 3, category_id: 4 },
      { post_id: 4, category_id: 5 },
      { post_id: 5, category_id: 6 },
      { post_id: 6, category_id: 7 },
      { post_id: 7, category_id: 8 },
      { post_id: 8, category_id: 9 },
      { post_id: 9, category_id: 10 },
      { post_id: 10, category_id: 1 },
      { post_id: 11, category_id: 11 },
      { post_id: 12, category_id: 12 }
    ];
    await PostCategory.bulkCreate(postCategories, { ignoreDuplicates: true });
    console.log("PostCategories inserted");

    // --- 10. Seed PostPhotos (depends on Posts and Photos, now 12 rows) ---
    const postPhotos = [
      { post_id: 1, photo_id: 1 },
      { post_id: 2, photo_id: 2 },
      { post_id: 3, photo_id: 3 },
      { post_id: 4, photo_id: 4 },
      { post_id: 5, photo_id: 5 },
      { post_id: 6, photo_id: 6 },
      { post_id: 7, photo_id: 7 },
      { post_id: 8, photo_id: 8 },
      { post_id: 9, photo_id: 9 },
      { post_id: 10, photo_id: 10 },
      { post_id: 11, photo_id: 11 },
      { post_id: 12, photo_id: 12 }
    ];
    await PostPhoto.bulkCreate(postPhotos, { ignoreDuplicates: true });
    console.log("PostPhotos inserted");

    // --- 11. Seed PostReports (now 12 rows) ---
    const postReports = [
      { userId: 1, postId: 1, reportType: 'SPAM', createdAt: new Date() },
      { userId: 2, postId: 2, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 3, postId: 3, reportType: 'OTHER', createdAt: new Date() },
      { userId: 4, postId: 4, reportType: 'SPAM', createdAt: new Date() },
      { userId: 5, postId: 5, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 6, postId: 6, reportType: 'OTHER', createdAt: new Date() },
      { userId: 7, postId: 7, reportType: 'SPAM', createdAt: new Date() },
      { userId: 8, postId: 8, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 9, postId: 9, reportType: 'OTHER', createdAt: new Date() },
      { userId: 10, postId: 10, reportType: 'SPAM', createdAt: new Date() },
      { userId: 11, postId: 11, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 12, postId: 12, reportType: 'OTHER', createdAt: new Date() }
    ];
    await PostReport.bulkCreate(postReports, { ignoreDuplicates: true });
    console.log("PostReports inserted");

    // --- 12. Seed Jobs (depends on Users, now 12 rows) ---
    const jobs = [
      { authorId: 1, summary: 'I need a financial lawyer', country: 'USA', city: 'New York', createdAt: new Date() },
      { authorId: 2, summary: 'Looking for a corporate lawyer', country: 'USA', city: 'Los Angeles', createdAt: new Date() },
      { authorId: 3, summary: 'Need a criminal defense lawyer', country: 'USA', city: 'Chicago', createdAt: new Date() },
      { authorId: 4, summary: 'Family lawyer needed', country: 'Canada', city: 'Toronto', createdAt: new Date() },
      { authorId: 5, summary: 'Intellectual property lawyer required', country: 'Canada', city: 'Vancouver', createdAt: new Date() },
      { authorId: 6, summary: 'Immigration lawyer wanted', country: 'UK', city: 'London', createdAt: new Date() },
      { authorId: 7, summary: 'Environmental lawyer needed', country: 'UK', city: 'Manchester', createdAt: new Date() },
      { authorId: 8, summary: 'Labor lawyer required', country: 'Australia', city: 'Sydney', createdAt: new Date() },
      { authorId: 9, summary: 'Tax lawyer wanted', country: 'Australia', city: 'Melbourne', createdAt: new Date() },
      { authorId: 10, summary: 'Commercial litigation lawyer needed', country: 'Germany', city: 'Berlin', createdAt: new Date() },
      { authorId: 11, summary: 'Real estate lawyer required', country: 'France', city: 'Paris', createdAt: new Date() },
      { authorId: 12, summary: 'International law expert needed', country: 'Spain', city: 'Madrid', createdAt: new Date() }
    ];
    await Job.bulkCreate(jobs, { ignoreDuplicates: true });
    console.log("Jobs inserted");

    // --- 13. Seed JobApplies (depends on Users and Jobs, now 12 rows) ---
    const jobApplies = [
      { userId: 1, jobId: 1, createdAt: new Date() },
      { userId: 2, jobId: 2, createdAt: new Date() },
      { userId: 3, jobId: 3, createdAt: new Date() },
      { userId: 4, jobId: 4, createdAt: new Date() },
      { userId: 5, jobId: 5, createdAt: new Date() },
      { userId: 6, jobId: 6, createdAt: new Date() },
      { userId: 7, jobId: 7, createdAt: new Date() },
      { userId: 8, jobId: 8, createdAt: new Date() },
      { userId: 9, jobId: 9, createdAt: new Date() },
      { userId: 10, jobId: 10, createdAt: new Date() },
      { userId: 11, jobId: 11, createdAt: new Date() },
      { userId: 12, jobId: 12, createdAt: new Date() }
    ];
    await JobApply.bulkCreate(jobApplies, { ignoreDuplicates: true });
    console.log("JobApplies inserted");

    // --- 14. Seed JobReports (now 12 rows) ---
    const jobReports = [
      { userId: 1, jobId: 1, reportType: 'SPAM', createdAt: new Date() },
      { userId: 2, jobId: 2, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 3, jobId: 3, reportType: 'OTHER', createdAt: new Date() },
      { userId: 4, jobId: 4, reportType: 'SPAM', createdAt: new Date() },
      { userId: 5, jobId: 5, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 6, jobId: 6, reportType: 'OTHER', createdAt: new Date() },
      { userId: 7, jobId: 7, reportType: 'SPAM', createdAt: new Date() },
      { userId: 8, jobId: 8, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 9, jobId: 9, reportType: 'OTHER', createdAt: new Date() },
      { userId: 10, jobId: 10, reportType: 'SPAM', createdAt: new Date() },
      { userId: 11, jobId: 11, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 12, jobId: 12, reportType: 'OTHER', createdAt: new Date() }
    ];
    await JobReport.bulkCreate(jobReports, { ignoreDuplicates: true });
    console.log("JobReports inserted");

    // --- 15. Seed LawyerDocs (depends on Lawyers, now 12 rows) ---
    const lawyerDocs = [
      { lawyerId: 1, idPath: '/docs/lawyer1/doc1.pdf' },
      { lawyerId: 2, idPath: '/docs/lawyer2/doc2.pdf' },
      { lawyerId: 3, idPath: '/docs/lawyer3/doc3.pdf' },
      { lawyerId: 4, idPath: '/docs/lawyer4/doc4.pdf' },
      { lawyerId: 5, idPath: '/docs/lawyer5/doc5.pdf' },
      { lawyerId: 6, idPath: '/docs/lawyer6/doc6.pdf' },
      { lawyerId: 7, idPath: '/docs/lawyer7/doc7.pdf' },
      { lawyerId: 8, idPath: '/docs/lawyer8/doc8.pdf' },
      { lawyerId: 9, idPath: '/docs/lawyer9/doc9.pdf' },
      { lawyerId: 10, idPath: '/docs/lawyer10/doc10.pdf' },
      { lawyerId: 11, idPath: '/docs/lawyer11/doc11.pdf' },
      { lawyerId: 12, idPath: '/docs/lawyer12/doc12.pdf' }
    ];
    await lawyerDoc.bulkCreate(lawyerDocs, { ignoreDuplicates: true });
    console.log("LawyerDocs inserted");

    // --- 16. Seed ProfileImages (depends on Users, already 12 rows) ---
    const profileImages = [
      { userId: 1, imagePath: '/profile_images/img1.jpg' },
      { userId: 2, imagePath: '/profile_images/img2.jpg' },
      { userId: 3, imagePath: '/profile_images/img3.jpg' },
      { userId: 4, imagePath: '/profile_images/img4.jpg' },
      { userId: 5, imagePath: '/profile_images/img5.jpg' },
      { userId: 6, imagePath: '/profile_images/img6.jpg' },
      { userId: 7, imagePath: '/profile_images/img7.jpg' },
      { userId: 8, imagePath: '/profile_images/img8.jpg' },
      { userId: 9, imagePath: '/profile_images/img9.jpg' },
      { userId: 10, imagePath: '/profile_images/img10.jpg' },
      { userId: 11, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQF9FvdZ1W1_9g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712227644410?e=1747267200&v=beta&t=gtyFT7KVD2DSofgabD6bc-_-F_F49OBRbRzSrjaDqZ0' },
      { userId: 12, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQFNmASyBMQboA/profile-displayphoto-shrink_100_100/B4DZRbZ7x9HYAU-/0/1736700313204?e=1747267200&v=beta&t=q6BItntvASBeWeEROT5ZIKQDQDqyFWd6VvINNk-3qPM' }
    ];
    await ProfileImage.bulkCreate(profileImages, { ignoreDuplicates: true });
    console.log("ProfileImages inserted");

    // --- 17. Seed Contacts (depends on Users, now 12 rows) ---
    const contacts = [
      { userId: 1, number: '1234567890' },
      { userId: 2, number: '2345678901' },
      { userId: 3, number: '3456789012' },
      { userId: 4, number: '4567890123' },
      { userId: 5, number: '5678901234' },
      { userId: 6, number: '6789012345' },
      { userId: 7, number: '7890123456' },
      { userId: 8, number: '8901234567' },
      { userId: 9, number: '9012345678' },
      { userId: 10, number: '0123456789' },
      { userId: 11, number: '1122334455' },
      { userId: 12, number: '2233445566' }
    ];
    await Contact.bulkCreate(contacts, { ignoreDuplicates: true });
    console.log("Contacts inserted");

    // --- 18. Seed Messages (depends on Users, now 12 rows) ---
    const messages = [
      { senderId: 1, receiverId: 2, content: 'Hello, how are you?', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 2, receiverId: 1, content: 'I am fine, thank you!', isRead: true, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 3, receiverId: 4, content: 'Are we meeting tomorrow?', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 4, receiverId: 3, content: 'Yes, see you then!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 5, receiverId: 6, content: 'Check out this article.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 6, receiverId: 5, content: 'I liked it!', isRead: true, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 7, receiverId: 8, content: 'Happy Birthday!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 8, receiverId: 7, content: 'Thank you!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 9, receiverId: 10, content: 'Let me know your thoughts.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 10, receiverId: 11, content: 'Will do, thanks!', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 11, receiverId: 12, content: 'Looking forward to our meeting.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { senderId: 12, receiverId: 1, content: 'Catch up soon!', isRead: false, createdAt: new Date(), updatedAt: new Date() }
    ];
    await Message.bulkCreate(messages, { ignoreDuplicates: true });
    console.log("Messages inserted");

    // --- 19. Seed Notifications (no FK dependencies, now 12 rows) ---
    const notifications = [
      { id: 1, title: 'Welcome', message: 'Thank you for joining us.' },
      { id: 2, title: 'Profile Updated', message: 'Your profile has been updated successfully.'},
      { id: 3, title: 'Reminder', message: 'Don\'t forget your appointment tomorrow.' },
      { id: 4, title: 'Security Alert', message: 'Suspicious login attempt detected.' },
      { id: 5, title: 'Special Offer', message: 'Check out our new features.' },
      { id: 6, title: 'New Post', message: 'A new post has been published in your feed.' },
      { id: 7, title: 'Event Notice', message: 'Upcoming webinar on tech trends.' },
      { id: 8, title: 'New Message', message: 'You have received a new message.' },
      { id: 9, title: 'Feedback Request', message: 'We value your feedback.' },
      { id: 10, title: 'Account Warning', message: 'Your account will expire soon.' },
      { id: 11, title: 'Service Update', message: 'Our terms have been updated.' },
      { id: 12, title: 'Invitation', message: 'Join our exclusive webinar.' }
    ];
    await Notification.bulkCreate(notifications, { ignoreDuplicates: true });
    console.log("Notifications inserted");

    // --- 20. Seed UserNotifications (depends on Users and Notifications, now 12 rows) ---
    const userNotifications = [
      { userId: 1, notification_id: 1, isRead: false, createdAt: new Date() },
      { userId: 2, notification_id: 2, isRead: true, createdAt: new Date() },
      { userId: 3, notification_id: 3, isRead: false, createdAt: new Date() },
      { userId: 4, notification_id: 4, isRead: false, createdAt: new Date() },
      { userId: 5, notification_id: 5, isRead: false, createdAt: new Date() },
      { userId: 6, notification_id: 6, isRead: true, createdAt: new Date() },
      { userId: 7, notification_id: 7, isRead: false, createdAt: new Date() },
      { userId: 8, notification_id: 8, isRead: false, createdAt: new Date() },
      { userId: 9, notification_id: 9, isRead: false, createdAt: new Date() },
      { userId: 10, notification_id: 10, isRead: false, createdAt: new Date() },
      { userId: 11, notification_id: 11, isRead: false, createdAt: new Date() },
      { userId: 12, notification_id: 12, isRead: false, createdAt: new Date() }
    ];
    await UserNotification.bulkCreate(userNotifications, { ignoreDuplicates: true });
    console.log("UserNotifications inserted");

    // --- 21. Seed Reacts (depends on Users and Posts, now 12 rows) ---
    const reacts = [
      { userId: 1, postId: 1, reaction: 'like', createdAt: new Date() },
      { userId: 2, postId: 2, reaction: 'love', createdAt: new Date() },
      { userId: 3, postId: 3, reaction: 'haha', createdAt: new Date() },
      { userId: 4, postId: 4, reaction: 'wow', createdAt: new Date() },
      { userId: 5, postId: 5, reaction: 'sad', createdAt: new Date() },
      { userId: 6, postId: 6, reaction: 'angry', createdAt: new Date() },
      { userId: 7, postId: 7, reaction: 'like', createdAt: new Date() },
      { userId: 8, postId: 8, reaction: 'love', createdAt: new Date() },
      { userId: 9, postId: 9, reaction: 'haha', createdAt: new Date() },
      { userId: 10, postId: 10, reaction: 'wow', createdAt: new Date() },
      { userId: 11, postId: 11, reaction: 'like', createdAt: new Date() },
      { userId: 12, postId: 12, reaction: 'love', createdAt: new Date() }
    ];
    await React.bulkCreate(reacts, { ignoreDuplicates: true });
    console.log("Reacts inserted");

    // --- 22. Seed Shares (depends on Users and Posts, now 12 rows) ---
    const shares = [
      { userId: 1, postId: 2, createdAt: new Date() },
      { userId: 2, postId: 3, createdAt: new Date() },
      { userId: 3, postId: 4, createdAt: new Date() },
      { userId: 4, postId: 5, createdAt: new Date() },
      { userId: 5, postId: 6, createdAt: new Date() },
      { userId: 6, postId: 7, createdAt: new Date() },
      { userId: 7, postId: 8, createdAt: new Date() },
      { userId: 8, postId: 9, createdAt: new Date() },
      { userId: 9, postId: 10, createdAt: new Date() },
      { userId: 10, postId: 11, createdAt: new Date() },
      { userId: 11, postId: 12, createdAt: new Date() },
      { userId: 12, postId: 1, createdAt: new Date() }
    ];
    await Share.bulkCreate(shares, { ignoreDuplicates: true });
    console.log("Shares inserted");

    // --- 23. Seed Comments (depends on Users and Posts, now 12 rows) ---
    const commentsData = [
      { postId: 1, userId: 1, content: 'Great post! Very informative.', createdAt: new Date() },
      { postId: 2, userId: 2, content: 'I completely agree with your opinion.', createdAt: new Date() },
      { postId: 3, userId: 3, content: 'This is so helpful, thanks!', createdAt: new Date() },
      { postId: 4, userId: 4, content: 'I learned something new today.', createdAt: new Date() },
      { postId: 5, userId: 5, content: 'Interesting perspective.', createdAt: new Date() },
      { postId: 6, userId: 6, content: 'Could you provide more details?', createdAt: new Date() },
      { postId: 7, userId: 7, content: 'Well written article.', createdAt: new Date() },
      { postId: 8, userId: 8, content: 'Looking forward to more posts like this.', createdAt: new Date() },
      { postId: 9, userId: 9, content: 'I have a different opinion on this.', createdAt: new Date() },
      { postId: 10, userId: 10, content: 'Thanks for sharing your thoughts.', createdAt: new Date() },
      { postId: 11, userId: 11, content: 'Really enjoyed this post!', createdAt: new Date() },
      { postId: 12, userId: 12, content: 'This was very insightful.', createdAt: new Date() }
    ];
    await Comment.bulkCreate(commentsData, { ignoreDuplicates: true });
    console.log("Comments inserted");

    // --- 24. Seed Connections (depends on Users, now 12 rows) ---
    const connections = [
      { requesterId: 1, receiverId: 2, status: 'pending', createdAt: new Date() },
      { requesterId: 2, receiverId: 3, status: 'accepted', createdAt: new Date() },
      { requesterId: 3, receiverId: 4, status: 'blocked', createdAt: new Date() },
      { requesterId: 4, receiverId: 5, status: 'pending', createdAt: new Date() },
      { requesterId: 5, receiverId: 6, status: 'accepted', createdAt: new Date() },
      { requesterId: 6, receiverId: 7, status: 'blocked', createdAt: new Date() },
      { requesterId: 7, receiverId: 8, status: 'pending', createdAt: new Date() },
      { requesterId: 8, receiverId: 9, status: 'accepted', createdAt: new Date() },
      { requesterId: 9, receiverId: 10, status: 'blocked', createdAt: new Date() },
      { requesterId: 10, receiverId: 11, status: 'pending', createdAt: new Date() },
      { requesterId: 11, receiverId: 12, status: 'accepted', createdAt: new Date() },
      { requesterId: 12, receiverId: 1, status: 'pending', createdAt: new Date() }
    ];
    await Connection.bulkCreate(connections, { ignoreDuplicates: true })
      .then(() => console.log("Connections inserted"))
      .catch(err => console.error("Error inserting connections:", err));

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// --- Express route to trigger database seeding ---
router.get('/', async (req, res, next) => {
  try {
    // Check if data already exists by counting users
    const userCount = await User.count();
    
    if (userCount === 0) {
      // Only seed if no data exists
      await seedDatabase();
      res.send("Database seeded successfully!");
    } 
    else {
      res.send("Database already contains data - skipping seed");
    }
    // Remove the next() call since we're already sending a response
  } catch (err) {
    console.error("Seeding failed:", err);
    res.status(500).send("Error seeding database.");
  }
});

module.exports = router;
