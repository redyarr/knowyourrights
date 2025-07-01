-- Migration to add verification fields to lawyers table
-- Run this SQL script to update your existing database

USE knowyourrights;

ALTER TABLE lawyers 
ADD COLUMN verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN verified_by INT NULL,
ADD COLUMN verification_date DATETIME NULL,
ADD COLUMN rejection_reason TEXT NULL;

-- Add foreign key constraint for verified_by field
ALTER TABLE lawyers 
ADD CONSTRAINT fk_lawyers_verified_by 
FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update existing lawyers to have pending status
UPDATE lawyers SET verification_status = 'pending' WHERE verification_status IS NULL;