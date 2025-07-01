# Lawyer Verification System Setup Guide

This guide explains how to set up and use the lawyer verification system that restricts lawyer posting and connection capabilities until admin approval.

## Overview

The lawyer verification system ensures that only verified lawyers can:
- Create posts
- Edit/delete posts
- Send connection requests

Lawyers must be approved by an admin before gaining these privileges.

## Database Setup

### 1. Run the Migration

Execute the SQL migration to add verification fields to the lawyers table:

```sql
-- Run this in your MySQL database
source migrations/add-lawyer-verification-fields.sql
```

Or manually run:

```sql
ALTER TABLE lawyers 
ADD COLUMN verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN verified_by INT NULL,
ADD COLUMN verification_date DATETIME NULL,
ADD COLUMN rejection_reason TEXT NULL;

ALTER TABLE lawyers 
ADD CONSTRAINT fk_lawyers_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

UPDATE lawyers SET verification_status = 'pending' WHERE verification_status IS NULL;
```

### 2. Create Admin User

Create an admin user in your database:

```sql
INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Admin', 'User', 'admin@example.com', '$2b$10$hashedpassword', 'admin', NOW(), NOW());
```

*Note: Replace the password with a properly hashed password using bcrypt.*

## System Components

### 1. Models
- **Lawyer Model** (`models/lawyer.js`): Extended with verification fields
- **User Model** (`models/user.js`): Contains role field with 'admin' option

### 2. Middleware
- **lawyerVerification.js**: Contains `isVerifiedLawyer` and `isAdmin` middleware

### 3. Controllers
- **adminController.js**: Handles admin dashboard and lawyer verification actions

### 4. Routes
- **admin.js**: Admin routes for lawyer verification management
- **feed.js**: Updated with verification middleware
- **mynetwork.js**: Updated with verification middleware

### 5. Views
- **admin/dashboard.ejs**: Admin dashboard showing pending lawyers
- **admin/lawyer-details.ejs**: Detailed lawyer information for review
- **lawyer/pending-verification.ejs**: Page shown to pending lawyers
- **lawyer/verification-rejected.ejs**: Page shown to rejected lawyers

## Usage

### For Lawyers

1. **Registration**: Lawyers register normally and are automatically set to 'pending' status
2. **Pending State**: Lawyers see a pending verification message and cannot post or connect
3. **Approved State**: Lawyers can post and connect normally
4. **Rejected State**: Lawyers see rejection reason and can update their profile

### For Admins

1. **Access Admin Panel**: Navigate to `/admin/dashboard`
2. **Review Lawyers**: View pending lawyers and their submitted information
3. **Approve/Reject**: 
   - Click "Approve" to verify a lawyer
   - Click "Reject" and provide a reason for rejection
4. **View All Lawyers**: See all lawyers with their verification status

## API Endpoints

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/lawyers` - List all lawyers
- `GET /admin/lawyer/:id` - View lawyer details
- `POST /admin/lawyer/:id/approve` - Approve lawyer
- `POST /admin/lawyer/:id/reject` - Reject lawyer

### Verification Status
- `pending` - Newly registered, awaiting review
- `approved` - Verified by admin, full access
- `rejected` - Rejected by admin, limited access

## Security Features

1. **Middleware Protection**: All sensitive routes protected by verification middleware
2. **Role-based Access**: Admin-only access to verification functions
3. **Session Management**: Proper session handling for authentication
4. **Input Validation**: Rejection reasons and approval actions validated

## Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure your database user has ALTER privileges
2. **Admin Access**: Verify admin user has role='admin' in database
3. **Middleware Issues**: Check that middleware is properly imported in routes
4. **Session Problems**: Ensure session middleware is configured in app.js

### Verification Status Not Updating

1. Check database connection
2. Verify lawyer ID in requests
3. Check admin permissions
4. Review server logs for errors

## Customization

### Adding More Verification Statuses

1. Update the ENUM in the database:
```sql
ALTER TABLE lawyers MODIFY verification_status ENUM('pending', 'approved', 'rejected', 'suspended');
```

2. Update the model in `models/lawyer.js`
3. Update middleware logic in `middlewares/lawyerVerification.js`
4. Update admin controller actions

### Custom Rejection Reasons

Modify the admin interface to include predefined rejection reasons or categories.

## Support

For issues or questions about the lawyer verification system:
1. Check the server logs for error messages
2. Verify database schema matches the migration
3. Ensure all middleware is properly configured
4. Test with a clean browser session