-- ==========================================
-- PROFESSIONAL GAMING PLATFORM DATABASE
-- ==========================================
-- Complete normalized schema for production use

-- ==========================================
-- USERS & AUTHENTICATION
-- ==========================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'vip', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ==========================================
-- WALLET & ECONOMY
-- ==========================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  soft_tokens BIGINT DEFAULT 0 CHECK (soft_tokens >= 0),
  hard_tokens BIGINT DEFAULT 0 CHECK (hard_tokens >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

CREATE TABLE wallet_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('PURCHASE', 'REWARD', 'REFUND', 'ADMIN_ADJUST', 'DAILY_BONUS', 'ACHIEVEMENT', 'REFERRAL')),
  token_type VARCHAR(10) NOT NULL CHECK (token_type IN ('SOFT', 'HARD')),
  amount BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reference VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movements_wallet ON wallet_movements(wallet_id);
CREATE INDEX idx_movements_type ON wallet_movements(type);
CREATE INDEX idx_movements_created ON wallet_movements(created_at DESC);

-- ==========================================
-- GAMES
-- ==========================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  category VARCHAR(50) CHECK (category IN ('arcade', 'puzzle', 'casual', 'runner', 'retro', 'multiplayer')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
  min_bet BIGINT DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_price BIGINT,
  supports_multiplayer BOOLEAN DEFAULT FALSE,
  controls_supported JSONB, -- ['keyboard', 'gamepad', 'touch']
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'deprecated')),
  total_plays BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_games_status ON games(status);

-- ==========================================
-- USER GAMES & PROGRESS
-- ==========================================

CREATE TABLE user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  times_played BIGINT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  high_score BIGINT DEFAULT 0,
  total_time_seconds BIGINT DEFAULT 0,
  owns_premium BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  favorite BOOLEAN DEFAULT FALSE,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_user_games_user ON user_games(user_id);
CREATE INDEX idx_user_games_game ON user_games(game_id);
CREATE INDEX idx_user_games_favorite ON user_games(user_id, favorite);

-- ==========================================
-- SCORES & LEADERBOARDS
-- ==========================================

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  score BIGINT NOT NULL,
  time_seconds INTEGER,
  difficulty VARCHAR(20),
  metadata JSONB, -- Game-specific stats
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_game_score ON scores(game_id, score DESC);
CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_created ON scores(created_at DESC);

-- ==========================================
-- GAMIFICATION
-- ==========================================

CREATE TABLE user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp BIGINT DEFAULT 0,
  xp_to_next_level BIGINT DEFAULT 1000,
  total_games_played BIGINT DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  daily_reward_claimed BOOLEAN DEFAULT FALSE,
  daily_reward_streak INTEGER DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  token_reward INTEGER DEFAULT 0,
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('daily', 'weekly', 'special')),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  requirement_type VARCHAR(50),
  requirement_target INTEGER,
  requirement_current INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  token_reward INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_missions_user ON missions(user_id);
CREATE INDEX idx_missions_expires ON missions(expires_at);

-- ==========================================
-- PAYMENTS & TRANSACTIONS
-- ==========================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) CHECK (type IN ('token_purchase', 'game_purchase', 'subscription')),
  amount_usd DECIMAL(10,2) NOT NULL,
  hard_tokens INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  payment_provider VARCHAR(50), -- 'paypal', 'stripe', etc
  provider_transaction_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_provider_id ON transactions(provider_transaction_id);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(50) CHECK (item_type IN ('game', 'skin', 'powerup', 'subscription')),
  item_id UUID,
  token_type VARCHAR(10) CHECK (token_type IN ('SOFT', 'HARD')),
  tokens_spent BIGINT NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_item ON purchases(item_type, item_id);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(50) CHECK (tier IN ('basic', 'premium', 'vip')),
  status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ==========================================
-- SOCIAL & REFERRALS
-- ==========================================

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referrer_reward_tokens INTEGER DEFAULT 0,
  referred_reward_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);

-- ==========================================
-- DEVICES & SETTINGS
-- ==========================================

CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  device_fingerprint VARCHAR(255),
  last_ip VARCHAR(45),
  last_user_agent TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_devices_user ON devices(user_id);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  music_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  keyboard_config JSONB,
  gamepad_config JSONB,
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ANALYTICS & EVENTS
-- ==========================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
