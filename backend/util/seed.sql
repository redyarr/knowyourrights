-- 1. educations
INSERT INTO educations (id, university, college, department, degree) VALUES
  (1, 'Harvard University', 'Harvard College', 'Computer Science', 'Bachelor'),
  (2, 'Stanford University', 'Stanford College', 'Engineering', 'Master'),
  (3, 'MIT', 'MIT College', 'Physics', 'PhD'),
  (4, 'University of Oxford', 'Oxford College', 'Philosophy', 'Bachelor'),
  (5, 'University of Cambridge', 'Cambridge College', 'Mathematics', 'Master'),
  (6, 'Yale University', 'Yale College', 'Economics', 'Bachelor'),
  (7, 'Princeton University', 'Princeton College', 'History', 'Master'),
  (8, 'Columbia University', 'Columbia College', 'Political Science', 'Bachelor'),
  (9, 'University of Chicago', 'Chicago College', 'Sociology', 'Master'),
  (10, 'Caltech', 'Caltech College', 'Chemistry', 'PhD'),
  (11, 'University of Michigan', 'Michigan College', 'Biology', 'Bachelor'),
  (12, 'University of Texas', 'Texas College', 'Law', 'Master');
SELECT * FROM educations;

-- 2. users
-- Note: Passwords here are in plain text for demo purposes.
INSERT INTO users (id, first_name, last_name, email, password, role, country, city, created_at, updated_at) VALUES
  (1, 'John', 'Doe', 'john.doe@example.com', 'password1', 'visitor', 'USA', 'New York', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Jane', 'Smith', 'jane.smith@example.com', 'password2', 'lawyer', 'USA', 'Los Angeles', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Alice', 'Johnson', 'alice.johnson@example.com', 'password3', 'admin', 'USA', 'Chicago', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Bob', 'Brown', 'bob.brown@example.com', 'password4', 'visitor', 'Canada', 'Toronto', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'Charlie', 'Davis', 'charlie.davis@example.com', 'password5', 'lawyer', 'Canada', 'Vancouver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'Dana', 'Miller', 'dana.miller@example.com', 'password6', 'admin', 'UK', 'London', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'Evan', 'Wilson', 'evan.wilson@example.com', 'password7', 'visitor', 'UK', 'Manchester', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 'Fiona', 'Moore', 'fiona.moore@example.com', 'password8', 'lawyer', 'Australia', 'Sydney', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 'George', 'Taylor', 'george.taylor@example.com', 'password9', 'admin', 'Australia', 'Melbourne', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 'Hannah', 'Anderson', 'hannah.anderson@example.com', 'password10', 'visitor', 'Germany', 'Berlin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 'Ivy', 'Lee', 'ivy.lee@example.com', 'password11', 'lawyer', 'France', 'Paris', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 'Jack', 'White', 'jack.white@example.com', 'password12', 'visitor', 'Spain', 'Madrid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
SELECT * FROM users;

-- 3. user_reports
INSERT INTO user_reports (user_id, reporter_id, report_type, created_at) VALUES
  (1, 2, 'SPAM', CURRENT_TIMESTAMP),
  (2, 3, 'ABUSE', CURRENT_TIMESTAMP),
  (3, 4, 'OTHER', CURRENT_TIMESTAMP),
  (4, 5, 'SPAM', CURRENT_TIMESTAMP),
  (5, 6, 'ABUSE', CURRENT_TIMESTAMP),
  (6, 7, 'OTHER', CURRENT_TIMESTAMP),
  (7, 8, 'SPAM', CURRENT_TIMESTAMP),
  (8, 9, 'ABUSE', CURRENT_TIMESTAMP),
  (9, 10, 'OTHER', CURRENT_TIMESTAMP),
  (10, 11, 'SPAM', CURRENT_TIMESTAMP),
  (11, 12, 'ABUSE', CURRENT_TIMESTAMP),
  (12, 1, 'OTHER', CURRENT_TIMESTAMP);
SELECT * FROM user_reports;

-- 4. lawyers
-- Depends on users
INSERT INTO lawyers (user_id, law_firm, license_number, summary, authority) VALUES
  (1, 'Law Firm A', 'LN1001', 'Experienced in civil law.', 'approved'),
  (2, 'Law Firm B', 'LN1002', 'Expert in corporate law.', 'consultant'),
  (3, 'Law Firm C', 'LN1003', 'Specializes in criminal defense.', 'training'),
  (4, 'Law Firm D', 'LN1004', 'Focuses on family law.', 'approved'),
  (5, 'Law Firm E', 'LN1005', 'Well-versed in intellectual property.', 'consultant'),
  (6, 'Law Firm F', 'LN1006', 'Handles immigration cases.', 'training'),
  (7, 'Law Firm G', 'LN1007', 'Expert in environmental law.', 'approved'),
  (8, 'Law Firm H', 'LN1008', 'Experienced in labor law.', 'consultant'),
  (9, 'Law Firm I', 'LN1009', 'Specialist in tax law.', 'training'),
  (10, 'Law Firm J', 'LN1010', 'Skilled in commercial litigation.', 'approved'),
  (11, 'Law Firm K', 'LN1011', 'Expert in intellectual property disputes.', 'consultant'),
  (12, 'Law Firm L', 'LN1012', 'Specializes in international law.', 'training');
SELECT * FROM lawyers;

-- 5. lawyer_educations
-- Depends on lawyers & educations
INSERT INTO lawyer_educations (lawyer_id, education_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10),
  (11, 11),
  (12, 12);
SELECT * FROM lawyer_educations;

-- 6. categories
INSERT INTO categories (id, name, description) VALUES
  (1, 'Technology', 'All tech-related topics'),
  (2, 'Science', 'Scientific discoveries and news'),
  (3, 'Health', 'Health and wellness advice'),
  (4, 'Travel', 'Travel guides and tips'),
  (5, 'Education', 'Educational resources and articles'),
  (6, 'Entertainment', 'Movies, music, and more'),
  (7, 'Sports', 'Latest sports news and events'),
  (8, 'Food', 'Recipes and restaurant reviews'),
  (9, 'Finance', 'Money management and investments'),
  (10, 'Lifestyle', 'Fashion, home, and personal care'),
  (11, 'Politics', 'Political discussions and news'),
  (12, 'Environment', 'Environmental issues and conservation');
SELECT * FROM categories;

-- 7. photos
INSERT INTO photos (id, photo_path) VALUES
  (1, '/images/photo1.jpg'),
  (2, '/images/photo2.jpg'),
  (3, '/images/photo3.jpg'),
  (4, '/images/photo4.jpg'),
  (5, '/images/photo5.jpg'),
  (6, '/images/photo6.jpg'),
  (7, '/images/photo7.jpg'),
  (8, '/images/photo8.jpg'),
  (9, '/images/photo9.jpg'),
  (10, '/images/photo10.jpg'),
  (11, '/images/photo11.jpg'),
  (12, '/images/photo12.jpg');
SELECT * FROM photos;

-- 8. posts
-- Depends on users
INSERT INTO posts (id, author_id, title, content, created_at) VALUES
  (1, 1, 'First Post', 'This is the content of the first post.', CURRENT_TIMESTAMP),
  (2, 2, 'Second Post', 'Content for the second post.', CURRENT_TIMESTAMP),
  (3, 3, 'Third Post', 'Here is what I have to say in post three.', CURRENT_TIMESTAMP),
  (4, 4, 'Fourth Post', 'Discussion on various topics in post four.', CURRENT_TIMESTAMP),
  (5, 5, 'Fifth Post', 'Insights and analysis in post five.', CURRENT_TIMESTAMP),
  (6, 6, 'Sixth Post', 'The sixth post content goes here.', CURRENT_TIMESTAMP),
  (7, 7, 'Seventh Post', 'Another interesting post number seven.', CURRENT_TIMESTAMP),
  (8, 8, 'Eighth Post', 'Post eight contains great insights.', CURRENT_TIMESTAMP),
  (9, 9, 'Ninth Post', 'Content for the ninth post is here.', CURRENT_TIMESTAMP),
  (10, 10, 'Tenth Post', 'Wrapping up with the tenth post content.', CURRENT_TIMESTAMP),
  (11, 11, 'Eleventh Post', 'Additional insights in the eleventh post.', CURRENT_TIMESTAMP),
  (12, 12, 'Twelfth Post', 'Final thoughts in the twelfth post.', CURRENT_TIMESTAMP);
SELECT * FROM posts;

-- 9. post_categories
-- Depends on posts & categories
INSERT INTO post_categories (post_id, category_id) VALUES
  (1, 2),
  (2, 3),
  (3, 4),
  (4, 5),
  (5, 6),
  (6, 7),
  (7, 8),
  (8, 9),
  (9, 10),
  (10, 1),
  (11, 11),
  (12, 12);
SELECT * FROM post_categories;

-- 10. post_photos
-- Depends on posts & photos
INSERT INTO post_photos (post_id, photo_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10),
  (11, 11),
  (12, 12);
SELECT * FROM post_photos;

-- 11. post_reports
INSERT INTO post_reports (user_id, post_id, report_type, created_at) VALUES
  (1, 1, 'SPAM', CURRENT_TIMESTAMP),
  (2, 2, 'ABUSE', CURRENT_TIMESTAMP),
  (3, 3, 'OTHER', CURRENT_TIMESTAMP),
  (4, 4, 'SPAM', CURRENT_TIMESTAMP),
  (5, 5, 'ABUSE', CURRENT_TIMESTAMP),
  (6, 6, 'OTHER', CURRENT_TIMESTAMP),
  (7, 7, 'SPAM', CURRENT_TIMESTAMP),
  (8, 8, 'ABUSE', CURRENT_TIMESTAMP),
  (9, 9, 'OTHER', CURRENT_TIMESTAMP),
  (10, 10, 'SPAM', CURRENT_TIMESTAMP),
  (11, 11, 'ABUSE', CURRENT_TIMESTAMP),
  (12, 12, 'OTHER', CURRENT_TIMESTAMP);
SELECT * FROM post_reports;

-- 12. jobs
-- Depends on users
INSERT INTO jobs (id, author_id, summary, country, city, created_at) VALUES
  (1, 1, 'I need a financial lawyer', 'USA', 'New York', CURRENT_TIMESTAMP),
  (2, 2, 'Looking for a corporate lawyer', 'USA', 'Los Angeles', CURRENT_TIMESTAMP),
  (3, 3, 'Need a criminal defense lawyer', 'USA', 'Chicago', CURRENT_TIMESTAMP),
  (4, 4, 'Family lawyer needed', 'Canada', 'Toronto', CURRENT_TIMESTAMP),
  (5, 5, 'Intellectual property lawyer required', 'Canada', 'Vancouver', CURRENT_TIMESTAMP),
  (6, 6, 'Immigration lawyer wanted', 'UK', 'London', CURRENT_TIMESTAMP),
  (7, 7, 'Environmental lawyer needed', 'UK', 'Manchester', CURRENT_TIMESTAMP),
  (8, 8, 'Labor lawyer required', 'Australia', 'Sydney', CURRENT_TIMESTAMP),
  (9, 9, 'Tax lawyer wanted', 'Australia', 'Melbourne', CURRENT_TIMESTAMP),
  (10, 10, 'Commercial litigation lawyer needed', 'Germany', 'Berlin', CURRENT_TIMESTAMP),
  (11, 11, 'Real estate lawyer required', 'France', 'Paris', CURRENT_TIMESTAMP),
  (12, 12, 'International law expert needed', 'Spain', 'Madrid', CURRENT_TIMESTAMP);
SELECT * FROM jobs;

-- 13. job_applies
-- Depends on users & jobs
INSERT INTO job_applies (user_id, job_id, created_at) VALUES
  (1, 1, CURRENT_TIMESTAMP),
  (2, 2, CURRENT_TIMESTAMP),
  (3, 3, CURRENT_TIMESTAMP),
  (4, 4, CURRENT_TIMESTAMP),
  (5, 5, CURRENT_TIMESTAMP),
  (6, 6, CURRENT_TIMESTAMP),
  (7, 7, CURRENT_TIMESTAMP),
  (8, 8, CURRENT_TIMESTAMP),
  (9, 9, CURRENT_TIMESTAMP),
  (10, 10, CURRENT_TIMESTAMP),
  (11, 11, CURRENT_TIMESTAMP),
  (12, 12, CURRENT_TIMESTAMP);
SELECT * FROM job_applies;

-- 14. job_reports
INSERT INTO job_reports (user_id, job_id, report_type, created_at) VALUES
  (1, 1, 'SPAM', CURRENT_TIMESTAMP),
  (2, 2, 'ABUSE', CURRENT_TIMESTAMP),
  (3, 3, 'OTHER', CURRENT_TIMESTAMP),
  (4, 4, 'SPAM', CURRENT_TIMESTAMP),
  (5, 5, 'ABUSE', CURRENT_TIMESTAMP),
  (6, 6, 'OTHER', CURRENT_TIMESTAMP),
  (7, 7, 'SPAM', CURRENT_TIMESTAMP),
  (8, 8, 'ABUSE', CURRENT_TIMESTAMP),
  (9, 9, 'OTHER', CURRENT_TIMESTAMP),
  (10, 10, 'SPAM', CURRENT_TIMESTAMP),
  (11, 11, 'ABUSE', CURRENT_TIMESTAMP),
  (12, 12, 'OTHER', CURRENT_TIMESTAMP);
SELECT * FROM job_reports;

-- 15. lawyer_docs
-- Depends on lawyers
INSERT INTO lawyer_docs (lawyer_id, id_path) VALUES
  (1, '/docs/lawyer1/doc1.pdf'),
  (2, '/docs/lawyer2/doc2.pdf'),
  (3, '/docs/lawyer3/doc3.pdf'),
  (4, '/docs/lawyer4/doc4.pdf'),
  (5, '/docs/lawyer5/doc5.pdf'),
  (6, '/docs/lawyer6/doc6.pdf'),
  (7, '/docs/lawyer7/doc7.pdf'),
  (8, '/docs/lawyer8/doc8.pdf'),
  (9, '/docs/lawyer9/doc9.pdf'),
  (10, '/docs/lawyer10/doc10.pdf'),
  (11, '/docs/lawyer11/doc11.pdf'),
  (12, '/docs/lawyer12/doc12.pdf');
SELECT * FROM lawyer_docs;

-- 16. profile_images
-- Depends on users
INSERT INTO profile_images (user_id, image_path) VALUES
  (1, '/profile_images/img1.jpg'),
  (2, '/profile_images/img2.jpg'),
  (3, '/profile_images/img3.jpg'),
  (4, '/profile_images/img4.jpg'),
  (5, '/profile_images/img5.jpg'),
  (6, '/profile_images/img6.jpg'),
  (7, '/profile_images/img7.jpg'),
  (8, '/profile_images/img8.jpg'),
  (9, '/profile_images/img9.jpg'),
  (10, '/profile_images/img10.jpg'),
  (11, 'https://example.com/profile_images/img11.jpg'),
  (12, 'https://example.com/profile_images/img12.jpg');
SELECT * FROM profile_images;

-- 17. contacts
-- Depends on users
INSERT INTO contacts (user_id, number) VALUES
  (1, '1234567890'),
  (2, '2345678901'),
  (3, '3456789012'),
  (4, '4567890123'),
  (5, '5678901234'),
  (6, '6789012345'),
  (7, '7890123456'),
  (8, '8901234567'),
  (9, '9012345678'),
  (10, '0123456789'),
  (11, '1122334455'),
  (12, '2233445566');
SELECT * FROM contacts;

-- 18. messages
-- Depends on users
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at, updated_at) VALUES
  (1, 2, 'Hello, how are you?', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 'I am fine, thank you!', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 4, 'Are we meeting tomorrow?', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 3, 'Yes, see you then!', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 6, 'Check out this article.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 5, 'I liked it!', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 8, 'Happy Birthday!', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 7, 'Thank you!', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (9, 10, 'Let me know your thoughts.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (10, 11, 'Will do, thanks!', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (11, 12, 'Looking forward to our meeting.', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (12, 1, 'Catch up soon!', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
SELECT * FROM messages;

-- 19. notifications
INSERT INTO notifications (id, title, message) VALUES
  (1, 'Welcome', 'Thank you for joining us.'),
  (2, 'Profile Updated', 'Your profile has been updated successfully.'),
  (3, 'Reminder', 'Don''t forget your appointment tomorrow.'),
  (4, 'Security Alert', 'Suspicious login attempt detected.'),
  (5, 'Special Offer', 'Check out our new features.'),
  (6, 'New Post', 'A new post has been published in your feed.'),
  (7, 'Event Notice', 'Upcoming webinar on tech trends.'),
  (8, 'New Message', 'You have received a new message.'),
  (9, 'Feedback Request', 'We value your feedback.'),
  (10, 'Account Warning', 'Your account will expire soon.'),
  (11, 'Service Update', 'Our terms have been updated.'),
  (12, 'Invitation', 'Join our exclusive webinar.');
SELECT * FROM notifications;


-- 20. user_notifications
-- Depends on users & notifications
INSERT INTO user_notifications (user_id, notification_id, is_read, created_at) VALUES
  (1, 1, false, CURRENT_TIMESTAMP),
  (2, 2, true, CURRENT_TIMESTAMP),
  (3, 3, false, CURRENT_TIMESTAMP),
  (4, 4, false, CURRENT_TIMESTAMP),
  (5, 5, false, CURRENT_TIMESTAMP),
  (6, 6, true, CURRENT_TIMESTAMP),
  (7, 7, false, CURRENT_TIMESTAMP),
  (8, 8, false, CURRENT_TIMESTAMP),
  (9, 9, false, CURRENT_TIMESTAMP),
  (10, 10, false, CURRENT_TIMESTAMP),
  (11, 11, false, CURRENT_TIMESTAMP),
  (12, 12, false, CURRENT_TIMESTAMP);
SELECT * FROM user_notifications;

-- 21. reacts
-- Depends on users & posts
INSERT INTO reacts (user_id, post_id, reaction, created_at) VALUES
  (1, 1, 'like', CURRENT_TIMESTAMP),
  (2, 2, 'love', CURRENT_TIMESTAMP),
  (3, 3, 'haha', CURRENT_TIMESTAMP),
  (4, 4, 'wow', CURRENT_TIMESTAMP),
  (5, 5, 'sad', CURRENT_TIMESTAMP),
  (6, 6, 'angry', CURRENT_TIMESTAMP),
  (7, 7, 'like', CURRENT_TIMESTAMP),
  (8, 8, 'love', CURRENT_TIMESTAMP),
  (9, 9, 'haha', CURRENT_TIMESTAMP),
  (10, 10, 'wow', CURRENT_TIMESTAMP),
  (11, 11, 'like', CURRENT_TIMESTAMP),
  (12, 12, 'love', CURRENT_TIMESTAMP);
SELECT * FROM reacts;

-- 22. shares
-- Depends on users & posts
INSERT INTO shares (user_id, post_id, created_at) VALUES
  (1, 2, CURRENT_TIMESTAMP),
  (2, 3, CURRENT_TIMESTAMP),
  (3, 4, CURRENT_TIMESTAMP),
  (4, 5, CURRENT_TIMESTAMP),
  (5, 6, CURRENT_TIMESTAMP),
  (6, 7, CURRENT_TIMESTAMP),
  (7, 8, CURRENT_TIMESTAMP),
  (8, 9, CURRENT_TIMESTAMP),
  (9, 10, CURRENT_TIMESTAMP),
  (10, 11, CURRENT_TIMESTAMP),
  (11, 12, CURRENT_TIMESTAMP),
  (12, 1, CURRENT_TIMESTAMP);
SELECT * FROM shares;

-- 23. comments
-- Depends on users & posts
INSERT INTO comments (post_id, user_id, content, created_at) VALUES
  (1, 1, 'Great post! Very informative.', CURRENT_TIMESTAMP),
  (2, 2, 'I completely agree with your opinion.', CURRENT_TIMESTAMP),
  (3, 3, 'This is so helpful, thanks!', CURRENT_TIMESTAMP),
  (4, 4, 'I learned something new today.', CURRENT_TIMESTAMP),
  (5, 5, 'Interesting perspective.', CURRENT_TIMESTAMP),
  (6, 6, 'Could you provide more details?', CURRENT_TIMESTAMP),
  (7, 7, 'Well written article.', CURRENT_TIMESTAMP),
  (8, 8, 'Looking forward to more posts like this.', CURRENT_TIMESTAMP),
  (9, 9, 'I have a different opinion on this.', CURRENT_TIMESTAMP),
  (10, 10, 'Thanks for sharing your thoughts.', CURRENT_TIMESTAMP),
  (11, 11, 'Really enjoyed this post!', CURRENT_TIMESTAMP),
  (12, 12, 'This was very insightful.', CURRENT_TIMESTAMP);
SELECT * FROM comments;

-- 24. connections
-- Depends on users
INSERT INTO connections (requester_id, receiver_id, status, created_at) VALUES
  (1, 2, 'pending', CURRENT_TIMESTAMP),
  (2, 3, 'accepted', CURRENT_TIMESTAMP),
  (3, 4, 'blocked', CURRENT_TIMESTAMP),
  (4, 5, 'pending', CURRENT_TIMESTAMP),
  (5, 6, 'accepted', CURRENT_TIMESTAMP),
  (6, 7, 'blocked', CURRENT_TIMESTAMP),
  (7, 8, 'pending', CURRENT_TIMESTAMP),
  (8, 9, 'accepted', CURRENT_TIMESTAMP),
  (9, 10, 'blocked', CURRENT_TIMESTAMP),
  (10, 11, 'pending', CURRENT_TIMESTAMP),
  (11, 12, 'accepted', CURRENT_TIMESTAMP),
  (12, 1, 'pending', CURRENT_TIMESTAMP);
SELECT * FROM connections;