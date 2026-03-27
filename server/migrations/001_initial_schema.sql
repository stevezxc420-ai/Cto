-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Viewer' CHECK (role IN ('Admin', 'Editor', 'Viewer')),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_credentials table
CREATE TABLE IF NOT EXISTS api_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255),
    provider VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rate_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cost_data table
CREATE TABLE IF NOT EXISTS cost_data (
    id SERIAL PRIMARY KEY,
    credential_id INTEGER REFERENCES api_credentials(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    service_type VARCHAR(100),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_data table
CREATE TABLE IF NOT EXISTS usage_data (
    id SERIAL PRIMARY KEY,
    credential_id INTEGER REFERENCES api_credentials(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    requests_count INTEGER DEFAULT 0,
    response_time_avg DECIMAL(10,2) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    bandwidth_used BIGINT DEFAULT 0,
    endpoints_called JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notifications BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(5) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_api_credentials_user_id ON api_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_api_credentials_active ON api_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_cost_data_credential_id ON cost_data(credential_id);
CREATE INDEX IF NOT EXISTS idx_cost_data_date ON cost_data(date);
CREATE INDEX IF NOT EXISTS idx_usage_data_credential_id ON usage_data(credential_id);
CREATE INDEX IF NOT EXISTS idx_usage_data_date ON usage_data(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_credentials_updated_at BEFORE UPDATE ON api_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (email, password, name, role, status) 
VALUES (
    'admin@api-analytics.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8JLX9W7Lz6', -- password: admin123
    'Admin User', 
    'Admin', 
    'Active'
) ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table (users can only see their own data unless admin)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Create RLS policies for api_credentials table
CREATE POLICY "Users can view own credentials" ON api_credentials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own credentials" ON api_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for cost_data table
CREATE POLICY "Users can view own cost data" ON cost_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM api_credentials 
            WHERE id = credential_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own cost data" ON cost_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM api_credentials 
            WHERE id = credential_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for usage_data table
CREATE POLICY "Users can view own usage data" ON usage_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM api_credentials 
            WHERE id = credential_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own usage data" ON usage_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM api_credentials 
            WHERE id = credential_id AND user_id = auth.uid()
        )
    );

-- Create RLS policies for user_settings table
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);