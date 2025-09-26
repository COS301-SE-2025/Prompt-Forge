-- Create user_badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    metadata TEXT,
    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_badge UNIQUE(user_id, badge_id)
);

-- Add missing columns to user_badges table if they don't exist (for existing installations)
DO $$ 
BEGIN
    -- Add progress column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_badges' AND column_name = 'progress') THEN
        ALTER TABLE user_badges ADD COLUMN progress INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add is_visible column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_badges' AND column_name = 'is_visible') THEN
        ALTER TABLE user_badges ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_badges' AND column_name = 'metadata') THEN
        ALTER TABLE user_badges ADD COLUMN metadata TEXT;
    END IF;
    
    -- Add earned_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_badges' AND column_name = 'earned_at') THEN
        ALTER TABLE user_badges ADD COLUMN earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(user_id, progress) WHERE progress >= 100;
CREATE INDEX IF NOT EXISTS idx_user_badges_visible ON user_badges(user_id, is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);
