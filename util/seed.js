const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

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
  UserReport
} = require('../models');

async function seedDatabase() {
  try {
    console.log("Starting to seed database...");

    // 1. Educations (no FK dependencies)
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
      { id: 10, university: 'Caltech', college: 'Caltech College', department: 'Chemistry', degree: 'PhD' }
    ];
    await Education.bulkCreate(educations, { ignoreDuplicates: true });
    console.log("Educations inserted");

    // 2. Users (no FK dependencies)
    const users = [
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
      { id: 11, firstName: 'Aland', lastName: 'S. Othman', email: 'aland@gmail.com', password: '123123', role: 'visitor', country: 'Iraq', city: 'Erbil', createdAt: new Date(), updatedAt: new Date() },
      { id: 12, firstName: 'Redyar', lastName: 'H. Rauf', email: 'redyar@gmail.com', password: '123123', role: 'visitor', country: 'Iraq', city: 'Sulaymaniyah', createdAt: new Date(), updatedAt: new Date() },
    ];
    // Hash passwords for each user
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    await User.bulkCreate(users, { ignoreDuplicates: true });
    console.log("Users inserted");

    const userReports = [
      { userId: 1, reportType: 'SPAM', createdAt: new Date() },
      { userId: 2, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 3, reportType: 'OTHER', createdAt: new Date() },
      { userId: 4, reportType: 'SPAM', createdAt: new Date() },
      { userId: 5, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 6, reportType: 'OTHER', createdAt: new Date() },
      { userId: 7, reportType: 'SPAM', createdAt: new Date() },
      { userId: 8, reportType: 'ABUSE', createdAt: new Date() },
      { userId: 9, reportType: 'OTHER', createdAt: new Date() },
      { userId: 10, reportType: 'SPAM', createdAt: new Date() }
    ];
    await UserReport.bulkCreate(userReports, { ignoreDuplicates: true });
    console.log("UserReports inserted");

    // 3. Lawyers (depends on Users)
    const lawyers = [
      { userId: 1, lawFirm: 'Law Firm A', licenseNumber: 'LN1001', summery: 'Experienced in civil law.' },
      { userId: 2, lawFirm: 'Law Firm B', licenseNumber: 'LN1002', summery: 'Expert in corporate law.' },
      { userId: 3, lawFirm: 'Law Firm C', licenseNumber: 'LN1003', summery: 'Specializes in criminal defense.' },
      { userId: 4, lawFirm: 'Law Firm D', licenseNumber: 'LN1004', summery: 'Focuses on family law.' },
      { userId: 5, lawFirm: 'Law Firm E', licenseNumber: 'LN1005', summery: 'Well-versed in intellectual property.' },
      { userId: 6, lawFirm: 'Law Firm F', licenseNumber: 'LN1006', summery: 'Handles immigration cases.' },
      { userId: 7, lawFirm: 'Law Firm G', licenseNumber: 'LN1007', summery: 'Expert in environmental law.' },
      { userId: 8, lawFirm: 'Law Firm H', licenseNumber: 'LN1008', summery: 'Experienced in labor law.' },
      { userId: 9, lawFirm: 'Law Firm I', licenseNumber: 'LN1009', summery: 'Specialist in tax law.' },
      { userId: 10, lawFirm: 'Law Firm J', licenseNumber: 'LN1010', summery: 'Skilled in commercial litigation.' }
    ];
    await Lawyer.bulkCreate(lawyers, { ignoreDuplicates: true });
    console.log("Lawyers inserted");

    // 4. LawyerEducations (depends on Lawyers and Educations)
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
      { lawyerId: 10, educationId: 10 }
    ];
    await LawyerEducation.bulkCreate(lawyerEducations, { ignoreDuplicates: true });
    console.log("LawyerEducations inserted");

    // 5. Categories (no FK dependencies)
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
      { id: 10, name: 'Lifestyle', description: 'Fashion, home, and personal care' }
    ];
    await Category.bulkCreate(categories, { ignoreDuplicates: true });
    console.log("Categories inserted");

    // 6. Photos (no FK dependencies)
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
      { id: 10, photoPath: '/images/photo10.jpg' }
    ];
    await Photo.bulkCreate(photos, { ignoreDuplicates: true });
    console.log("Photos inserted");

    // 7. Posts (depends on Users)
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
      { id: 10, authorId: 10, title: 'Tenth Post', content: 'Wrapping up with the tenth post content.', createdAt: new Date() }
    ];
    await Post.bulkCreate(posts, { ignoreDuplicates: true });
    console.log("Posts inserted");

    // 8. PostCategories (depends on Posts and Categories)
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
      { post_id: 10, category_id: 1 }
    ];
    await PostCategory.bulkCreate(postCategories, { ignoreDuplicates: true });
    console.log("PostCategories inserted");

    // 9. PostPhotos (depends on Posts and Photos)
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
      { post_id: 10, photo_id: 10 }
    ];
    await PostPhoto.bulkCreate(postPhotos, { ignoreDuplicates: true });
    console.log("PostPhotos inserted");

    const postReports = [
      { userId: 1, postId: 1, RoportType: 'SPAM', createdAt: new Date() },
      { userId: 2, postId: 2, RoportType: 'ABUSE', createdAt: new Date() },
      { userId: 3, postId: 3, RoportType: 'OTHER', createdAt: new Date() },
      { userId: 4, postId: 4, RoportType: 'SPAM', createdAt: new Date() },
      { userId: 5, postId: 5, RoportType: 'ABUSE', createdAt: new Date() },
      { userId: 6, postId: 6, RoportType: 'OTHER', createdAt: new Date() },
      { userId: 7, postId: 7, RoportType: 'SPAM', createdAt: new Date() },
      { userId: 8, postId: 8, RoportType: 'ABUSE', createdAt: new Date() },
      { userId: 9, postId: 9, RoportType: 'OTHER', createdAt: new Date() },
      { userId: 10, postId: 10, RoportType: 'SPAM', createdAt: new Date() }
    ];
    await PostReport.bulkCreate(postReports, { ignoreDuplicates: true });
    console.log("PostReports inserted");

    const jobApplies = [
      { userId: 1, postId: 1, createdAt: new Date() },
      { userId: 2, postId: 2, createdAt: new Date() },
      { userId: 3, postId: 3, createdAt: new Date() },
      { userId: 4, postId: 4, createdAt: new Date() },
      { userId: 5, postId: 5, createdAt: new Date() },
      { userId: 6, postId: 6, createdAt: new Date() },
      { userId: 7, postId: 7, createdAt: new Date() },
      { userId: 8, postId: 8, createdAt: new Date() },
      { userId: 9, postId: 9, createdAt: new Date() },
      { userId: 10, postId: 10, createdAt: new Date() }
    ];
    await JobApply.bulkCreate(jobApplies, { ignoreDuplicates: true });
    console.log("JobApplies inserted");

    // 10. ProfileImages (depends on Posts)
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
      { userId: 11, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQF9FvdZ1W1_9g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712227644410?e=1746662400&v=beta&t=h_guvHTPpOuEEWiAAnuGwQLiaaMLVRgSJGwzP79vRlU' },
      { userId: 12, imagePath: 'https://media.licdn.com/dms/image/v2/D4D03AQFNmASyBMQboA/profile-displayphoto-shrink_400_400/B4DZRbZ7x9HYAg-/0/1736700313203?e=1746662400&v=beta&t=qfhBlmBJDcKbzGyYfcKH2cCgtIzQzSDvXuGmLKBxY0U' },
    ];
    await ProfileImage.bulkCreate(profileImages, { ignoreDuplicates: true });
    console.log("ProfileImages inserted");

    // 11. Contacts (depends on Users)
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
      { userId: 10, number: '0123456789' }
    ];
    await Contact.bulkCreate(contacts, { ignoreDuplicates: true });
    console.log("Contacts inserted");

    // 13. Messages (depends on Users)
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
      { senderId: 10, receiverId: 9, content: 'Will do, thanks!', isRead: false, createdAt: new Date(), updatedAt: new Date() }
    ];
    await Message.bulkCreate(messages, { ignoreDuplicates: true });
    console.log("Messages inserted");

    // 14. Notifications (no FK dependencies)
    const notifications = [
      { id: 1, title: 'Welcome', message: 'Thank you for joining us.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, title: 'Profile Updated', message: 'Your profile has been updated successfully.', isRead: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, title: 'Reminder', message: 'Don\'t forget your appointment tomorrow.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, title: 'Security Alert', message: 'Suspicious login attempt detected.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, title: 'Special Offer', message: 'Check out our new features.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, title: 'New Post', message: 'A new post has been published in your feed.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, title: 'Event Notice', message: 'Upcoming webinar on tech trends.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 8, title: 'New Message', message: 'You have received a new message.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 9, title: 'Feedback Request', message: 'We value your feedback.', isRead: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 10, title: 'Account Warning', message: 'Your account will expire soon.', isRead: false, createdAt: new Date(), updatedAt: new Date() }
    ];
    await Notification.bulkCreate(notifications, { ignoreDuplicates: true });
    console.log("Notifications inserted");

    // 15. UserNotifications (depends on Users and Notifications)
    const userNotifications = [
      { userId: 1, notificationId: 1 },
      { userId: 2, notificationId: 2 },
      { userId: 3, notificationId: 3 },
      { userId: 4, notificationId: 4 },
      { userId: 5, notificationId: 5 },
      { userId: 6, notificationId: 6 },
      { userId: 7, notificationId: 7 },
      { userId: 8, notificationId: 8 },
      { userId: 9, notificationId: 9 },
      { userId: 10, notificationId: 10 }
    ];
    await UserNotification.bulkCreate(userNotifications, { ignoreDuplicates: true });
    console.log("UserNotifications inserted");

    // 16. Reacts (depends on Users and Posts)
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
      { userId: 10, postId: 10, reaction: 'wow', createdAt: new Date() }
    ];
    await React.bulkCreate(reacts, { ignoreDuplicates: true });
    console.log("Reacts inserted");

    // 17. Shares (depends on Users and Posts)
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
      { userId: 10, postId: 1, createdAt: new Date() }
    ];
    await Share.bulkCreate(shares, { ignoreDuplicates: true });
    console.log("Shares inserted");

    // 18. Comments (depends on Users and Posts)
    const commentsData = [
      { postId: 1, userId: 1, content: 'Great post! Very informative.', createdAt: new Date() },
      { postId: 1, userId: 1, content: 'I completely agree with your opinion.', createdAt: new Date() },
      { postId: 2, userId: 3, content: 'This is so helpful, thanks!', createdAt: new Date() },
      { postId: 2, userId: 2, content: 'I learned something new today.', createdAt: new Date() },
      { postId: 3, userId: 4, content: 'Interesting perspective.', createdAt: new Date() },
      { postId: 3, userId: 7, content: 'Could you provide more details?', createdAt: new Date() },
      { postId: 4, userId: 6, content: 'Well written article.', createdAt: new Date() },
      { postId: 4, userId: 9, content: 'Looking forward to more posts like this.', createdAt: new Date() },
      { postId: 5, userId: 1, content: 'I have a different opinion on this.', createdAt: new Date() },
      { postId: 5, userId: 6, content: 'Thanks for sharing your thoughts.', createdAt: new Date() }
    ];
    await Comment.bulkCreate(commentsData, { ignoreDuplicates: true });
    console.log("Comments inserted");

    // 19. Connections (depends on Users; adjust IDs if necessary)
    const connections = [
      { requesterId: 101, receiverId: 201, status: 'pending', createdAt: new Date() },
      { requesterId: 102, receiverId: 202, status: 'accepted', createdAt: new Date() },
      { requesterId: 103, receiverId: 203, status: 'blocked', createdAt: new Date() },
      { requesterId: 104, receiverId: 204, status: 'pending', createdAt: new Date() },
      { requesterId: 105, receiverId: 205, status: 'accepted', createdAt: new Date() },
      { requesterId: 106, receiverId: 206, status: 'blocked', createdAt: new Date() },
      { requesterId: 107, receiverId: 207, status: 'pending', createdAt: new Date() },
      { requesterId: 108, receiverId: 208, status: 'accepted', createdAt: new Date() },
      { requesterId: 109, receiverId: 209, status: 'blocked', createdAt: new Date() },
      { requesterId: 110, receiverId: 210, status: 'pending', createdAt: new Date() }
    ];
    await Connection.bulkCreate(connections, { ignoreDuplicates: true });
    console.log("Connections inserted");

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

router.get('/', async (req, res) => {
  try {
    await seedDatabase();
    res.send("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
    res.status(500).send("Error seeding database.");
  }
});

module.exports = router;
