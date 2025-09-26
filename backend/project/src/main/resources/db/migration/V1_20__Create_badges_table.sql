-- Create badges table if it doesn't exist
CREATE TABLE IF NOT EXISTS badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(50),
    color VARCHAR(20),
    category VARCHAR(50),
    criteria TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    rarity VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to badges table if they don't exist (for existing installations)
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'badges' AND column_name = 'is_active') THEN
        ALTER TABLE badges ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    -- Add rarity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'badges' AND column_name = 'rarity') THEN
        ALTER TABLE badges ADD COLUMN rarity VARCHAR(20);
    END IF;
    
    -- Add criteria column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'badges' AND column_name = 'criteria') THEN
        ALTER TABLE badges ADD COLUMN criteria TEXT;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'badges' AND column_name = 'created_at') THEN
        ALTER TABLE badges ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'badges' AND column_name = 'updated_at') THEN
        ALTER TABLE badges ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_badges_name ON badges(name);
