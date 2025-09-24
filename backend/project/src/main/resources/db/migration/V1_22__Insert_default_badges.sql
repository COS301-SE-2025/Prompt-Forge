-- Insert default badges (only if they don't already exist)
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
('Beta Tester', 'Participated in beta testing', 'TestTube', '#8B5CF6', 'special', 'rare'),

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
('Viral Sensation', 'One prompt reached 10000+ uses', 'Bolt', '#EF4444', 'viral', 'epic')

ON CONFLICT (name) DO NOTHING;

-- Update any existing badges that might have different data
UPDATE badges SET 
    description = CASE name
        WHEN 'First Prompt' THEN 'Created your first prompt'
        WHEN 'Prolific Creator' THEN 'Created 10 prompts'
        WHEN 'Prompt Master' THEN 'Created 50 prompts'
        WHEN 'Community Legend' THEN 'Created 100 prompts'
        WHEN 'Rising Star' THEN 'Received 10 total ratings'
        WHEN 'Highly Rated' THEN 'Average rating above 4.0'
        WHEN 'Excellence' THEN 'Average rating above 4.5'
        WHEN 'Perfection' THEN 'Average rating of 5.0'
        WHEN 'Social Butterfly' THEN 'Following 25+ users'
        WHEN 'Influencer' THEN 'Has 50+ followers'
        WHEN 'Community Leader' THEN 'Has 100+ followers'
        WHEN 'Early Adopter' THEN 'One of the first 100 users'
        WHEN 'Verified Creator' THEN 'Verified account'
        WHEN 'Beta Tester' THEN 'Participated in beta testing'
        WHEN 'Consistent Creator' THEN 'Created prompts for 7 consecutive days'
        WHEN 'Marathon Creator' THEN 'Created prompts for 30 consecutive days'
        WHEN 'Helpful Reviewer' THEN 'Left 25+ helpful reviews'
        WHEN 'Top Reviewer' THEN 'Left 100+ helpful reviews'
        WHEN 'Category Explorer' THEN 'Created prompts in 5+ categories'
        WHEN 'Renaissance Creator' THEN 'Created prompts in all categories'
        WHEN 'Popular Creator' THEN 'One prompt reached 1000+ uses'
        WHEN 'Viral Sensation' THEN 'One prompt reached 10000+ uses'
        ELSE description
    END,
    is_active = true,
    updated_at = CURRENT_TIMESTAMP
WHERE name IN (
    'First Prompt', 'Prolific Creator', 'Prompt Master', 'Community Legend',
    'Rising Star', 'Highly Rated', 'Excellence', 'Perfection',
    'Social Butterfly', 'Influencer', 'Community Leader',
    'Early Adopter', 'Verified Creator', 'Beta Tester',
    'Consistent Creator', 'Marathon Creator',
    'Helpful Reviewer', 'Top Reviewer',
    'Category Explorer', 'Renaissance Creator',
    'Popular Creator', 'Viral Sensation'
);
