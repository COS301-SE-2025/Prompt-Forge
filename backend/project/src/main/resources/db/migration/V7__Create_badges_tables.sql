-- V7__Create_badges_tables.sql
-- Migration script to create badges and user_badges tables

-- Create badges table
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

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    metadata TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(is_active);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(user_id, progress) WHERE progress >= 100;
CREATE INDEX IF NOT EXISTS idx_user_badges_visible ON user_badges(user_id, is_visible) WHERE is_visible = true;

-- Insert default badges
INSERT INTO badges (name, description, icon, color, category, rarity) VALUES
-- Milestone badges
('First Prompt', 'Created your first prompt', 'Rocket', '#10B981', 'milestone', 'common'),
('Prolific Creator', 'Created 10 prompts', 'Zap', '#8B5CF6', 'achievement', 'uncommon'),
('Prompt Master', 'Created 50 prompts', 'Crown', '#F59E0B', 'achievement', 'rare'),
('Community Legend', 'Created 100 prompts', 'Trophy', '#EF4444', 'achievement', 'epic'),

-- Rating badges
('Rising Star', 'Received 10 total ratings', 'Star', '#3B82F6', 'social', 'common'),
('Highly Rated', 'Average rating above 4.0', 'Award', '#10B981', 'achievement', 'uncommon'),
('Excellence', 'Average rating above 4.5', 'Medal', '#F59E0B', 'achievement', 'rare'),
('Perfection', 'Average rating of 5.0', 'Gem', '#8B5CF6', 'achievement', 'legendary'),

-- Social badges
('Social Butterfly', 'Following 25+ users', 'Users', '#06B6D4', 'social', 'common'),
('Influencer', 'Has 50+ followers', 'Megaphone', '#EC4899', 'social', 'uncommon'),
('Community Leader', 'Has 100+ followers', 'Shield', '#F59E0B', 'social', 'rare'),

-- Special badges
('Early Adopter', 'One of the first 100 users', 'Calendar', '#6366F1', 'special', 'rare'),
('Verified Creator', 'Verified account', 'CheckCircle', '#10B981', 'verification', 'uncommon'),
('Beta Tester', 'Participated in beta testing', 'Target', '#8B5CF6', 'special', 'rare'),

-- Streak badges
('Consistent Creator', 'Created prompts for 7 consecutive days', 'Target', '#F97316', 'streak', 'uncommon'),
('Marathon Creator', 'Created prompts for 30 consecutive days', 'Flame', '#EF4444', 'streak', 'rare'),

-- Contribution badges
('Helpful Reviewer', 'Left 25+ helpful reviews', 'MessageCircle', '#06B6D4', 'contribution', 'common'),
('Top Reviewer', 'Left 100+ helpful reviews', 'ThumbsUp', '#10B981', 'contribution', 'uncommon'),

-- Exploration badges
('Category Explorer', 'Created prompts in 5+ categories', 'Compass', '#8B5CF6', 'exploration', 'common'),
('Renaissance Creator', 'Created prompts in all categories', 'BookOpen', '#F59E0B', 'exploration', 'rare'),

-- Viral badges
('Popular Creator', 'One prompt reached 1000+ uses', 'TrendingUp', '#EC4899', 'viral', 'rare'),
('Viral Sensation', 'One prompt reached 10000+ uses', 'Sparkles', '#EF4444', 'viral', 'epic')

ON CONFLICT (name) DO NOTHING;