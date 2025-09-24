-- V6__Create_notifications_table.sql
-- Migration script to create the notifications table

CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    prompt_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON notification(user_id);
CREATE INDEX idx_notifications_created_at ON notification(created_at);
CREATE INDEX idx_notifications_is_read ON notification(is_read);
CREATE INDEX idx_notifications_type ON notification(type);
CREATE INDEX idx_notifications_prompt_id ON notification(prompt_id);

-- Create composite index for common queries
CREATE INDEX idx_notifications_user_unread ON notification(user_id, is_read) WHERE is_read = FALSE;
