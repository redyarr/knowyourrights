const { sequelize } = require('../util/db');
console.log("Initializing models...");

// Import models
const Connection = require('./connection');
const Contact = require('./contact');
const Education = require('./education');
const Job = require('./job')
const JobApply = require('./jobApply')
const JobReport = require('./jobReport')
const User = require('./user');
const Category = require('./category');
const Post = require('./post');
const Lawyer = require('./lawyer');
const Comment = require('./comment');
const React = require('./react');
const Message = require('./message');
const Notification = require('./notification');
const Share = require('./share');
const Photo = require('./photo');
const PostPhoto = require('./postPhoto');
const PostCategory = require('./postCategory');
const UserNotification = require('./userNotification');
const ProfileImage = require('./profileImage');
const LawyerEducation = require('./lawyerEducation')
const PostReport = require('./postReport');
const UserReport = require('./userReport');
const lawyerDoc = require('./lawwyerDoc');
const LawyerFeedback = require('./lawyerFeedback');




console.log("Models imported successfully");

// Define associations
try {
    // User and Lawyer
    User.hasOne(Lawyer, { foreignKey: 'user_id' });
    Lawyer.belongsTo(User, { foreignKey: 'user_id' });

    // Lawyer and Education
    Lawyer.belongsToMany(Education, { through: LawyerEducation, foreignKey: 'lawyer_id' });
    Education.belongsToMany(Lawyer, { through: LawyerEducation, foreignKey: 'education_id' });

    // Lawyer and LawyerDoc
    Lawyer.hasMany(lawyerDoc, { foreignKey: 'lawyerId' });  // Changed to 'lawyerId'
    lawyerDoc.belongsTo(Lawyer, { foreignKey: 'lawyerId' });
    
    // Lawyer and LawyerFeedback
    Lawyer.hasMany(LawyerFeedback, { foreignKey: 'lawyer_id' });
    LawyerFeedback.belongsTo(Lawyer, { foreignKey: 'lawyer_id' });
    
    // User and LawyerFeedback
    User.hasMany(LawyerFeedback, { foreignKey: 'user_id' });
    LawyerFeedback.belongsTo(User, { foreignKey: 'user_id' });

    // User and Post
    User.hasMany(Post, { foreignKey: 'author_id' });
    Post.belongsTo(User, { foreignKey: 'author_id' });

    // User and Job
    User.hasMany(Job, { foreignKey: 'author_id' });
    Job.belongsTo(User, { foreignKey: 'author_id' });

    // Job and JobReport
    Job.hasMany(JobReport, { foreignKey: 'job_id' });
    JobReport.belongsTo(Job, { foreignKey: 'job_id' });

    // User and JobReport
    User.hasMany(JobReport, { foreignKey: 'user_id' });
    JobReport.belongsTo(User, { foreignKey: 'user_id' });

    // Post and PostReport
    Post.hasMany(PostReport, { foreignKey: 'post_id' });
    PostReport.belongsTo(Post, { foreignKey: 'post_id' });

    // User and PostReport
    User.hasMany(PostReport, { foreignKey: 'user_id' });
    PostReport.belongsTo(User, { foreignKey: 'user_id' });

    // Job and JobApply
    Job.hasMany(JobApply, { foreignKey: 'job_id' });
    JobApply.belongsTo(Job, { foreignKey: 'job_id' });

    // User and JobApply
    User.hasMany(JobApply, { foreignKey: 'user_id' });
    JobApply.belongsTo(User, { foreignKey: 'user_id' });

    // User and UserReport
    User.hasMany(UserReport, { foreignKey: 'user_id' });
    UserReport.belongsTo(User, { foreignKey: 'user_id' });

    // Reporter and UserReport
    User.hasMany(UserReport, { foreignKey: 'reporter_id' });
    UserReport.belongsTo(User, { foreignKey: 'reporter_id' });

    // User and Contact
    User.hasMany(Contact, { foreignKey: 'user_id' });
    Contact.belongsTo(User, { foreignKey: 'user_id' });

    // User and Connection
    User.hasMany(Connection, { as: 'sentRequests', foreignKey: 'requester_id' });
    User.hasMany(Connection, { as: 'receivedRequests', foreignKey: 'receiver_id' });
    Connection.belongsTo(User, { as: 'requester', foreignKey: 'requester_id' });
    Connection.belongsTo(User, { as: 'receiver', foreignKey: 'receiver_id' });
    Connection.belongsTo(User, { as: 'connectedUser', foreignKey: 'receiver_id' });

    // User and Message
    User.hasMany(Message, { foreignKey: 'sender_id' });
    User.hasMany(Message, { foreignKey: 'receiver_id' });
    Message.belongsTo(User, { foreignKey: 'sender_id' });
    Message.belongsTo(User, { foreignKey: 'receiver_id' });

    // User and Notification through UserNotification
    User.hasMany(UserNotification, { foreignKey: 'user_id' });
    UserNotification.belongsTo(User, { foreignKey: 'user_id' });

    Notification.hasMany(UserNotification, { foreignKey: 'notification_id' });
    UserNotification.belongsTo(Notification, { foreignKey: 'notification_id' });

    // User and Share
    User.hasMany(Share, { foreignKey: 'user_id' });
    Share.belongsTo(User, { foreignKey: 'user_id' });

    // User and Comment
    User.hasMany(Comment, { foreignKey: 'user_id' });
    Comment.belongsTo(User, { foreignKey: 'user_id' });

    // User and React
    User.hasMany(React, { foreignKey: 'user_id' });
    React.belongsTo(User, { foreignKey: 'user_id' });

    // Post and React
    Post.hasMany(React, { foreignKey: 'post_id' });
    React.belongsTo(Post, { foreignKey: 'post_id' });

    // Post and Share
    Post.hasMany(Share, { foreignKey: 'post_id' });
    Share.belongsTo(Post, { foreignKey: 'post_id' });

    // Post and Comment
    Post.hasMany(Comment, { foreignKey: 'post_id' });
    Comment.belongsTo(Post, { foreignKey: 'post_id' });

    // Post and Photo
    Post.belongsToMany(Photo, { through: PostPhoto, foreignKey: 'post_id' });
    Photo.belongsToMany(Post, { through: PostPhoto, foreignKey: 'photo_id' });

    // Post and Category through PostCategory
    Post.belongsToMany(Category, { through: PostCategory, foreignKey: 'post_id' });
    Category.belongsToMany(Post, { through: PostCategory, foreignKey: 'category_id' });

    // User and ProfileImage
    User.hasOne(ProfileImage, { foreignKey: 'user_id' });
    ProfileImage.belongsTo(User, { foreignKey: 'user_id' });

    console.log("Associations defined successfully");
} catch (error) {
    console.error("Error defining associations:", error);
}

module.exports = {
    sequelize,
    User,
    Post,
    Comment,
    Category,
    Lawyer,
    React,
    Contact,
    Connection,
    Notification,
    PostCategory,
    Message,
    Share,
    PostPhoto,
    UserNotification,
    Photo,
    ProfileImage,
    Education,
    LawyerEducation,
    JobApply,
    PostReport,
    UserReport,
    lawyerDoc,
    Job,
    JobReport,
    LawyerFeedback
};

console.log("Models exported");

// Post and PostPhoto
Post.hasMany(PostPhoto, { foreignKey: 'postId' });
PostPhoto.belongsTo(Post, { foreignKey: 'postId' });
// PostPhoto and Photo
PostPhoto.belongsTo(Photo, { foreignKey: 'photoId' });
Photo.hasMany(PostPhoto, { foreignKey: 'photoId' });