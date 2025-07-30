-- School Assistant Database Schema
-- Supabase PostgreSQL Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    instructor VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Course relationship table
CREATE TABLE user_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active',
    grade_goal DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id VARCHAR(255),
    platform VARCHAR(50) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_score DECIMAL(10,2),
    weight DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending',
    submission_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grades table
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    score DECIMAL(10,2),
    max_score DECIMAL(10,2),
    percentage DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform credentials table (encrypted)
CREATE TABLE platform_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    credentials JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync logs table
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    new_items JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
);

-- Study sessions table
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_platform ON courses(platform);
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_platform ON assignments(platform);
CREATE INDEX idx_grades_user_id ON grades(user_id);
CREATE INDEX idx_grades_assignment_id ON grades(assignment_id);
CREATE INDEX idx_grades_course_id ON grades(course_id);
CREATE INDEX idx_platform_credentials_user_id ON platform_credentials(user_id);
CREATE INDEX idx_platform_credentials_platform ON platform_credentials(platform);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_platform ON sync_logs(platform);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_course_id ON study_sessions(course_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_credentials_updated_at BEFORE UPDATE ON platform_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User courses policies
CREATE POLICY "Users can view their courses" ON user_courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their courses" ON user_courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their courses" ON user_courses FOR UPDATE USING (auth.uid() = user_id);

-- Course policies (users can view courses they're enrolled in)
CREATE POLICY "Users can view enrolled courses" ON courses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_courses 
        WHERE user_courses.course_id = courses.id 
        AND user_courses.user_id = auth.uid()
    )
);

-- Assignment policies
CREATE POLICY "Users can view assignments for their courses" ON assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_courses 
        WHERE user_courses.course_id = assignments.course_id 
        AND user_courses.user_id = auth.uid()
    )
);

-- Grade policies
CREATE POLICY "Users can view their own grades" ON grades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own grades" ON grades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own grades" ON grades FOR UPDATE USING (auth.uid() = user_id);

-- Platform credentials policies
CREATE POLICY "Users can view their platform credentials" ON platform_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their platform credentials" ON platform_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their platform credentials" ON platform_credentials FOR UPDATE USING (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Sync logs policies
CREATE POLICY "Users can view their sync logs" ON sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their sync logs" ON sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view their study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their study sessions" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create views for common queries
CREATE VIEW user_dashboard AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT uc.course_id) as total_courses,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT CASE WHEN a.due_date < NOW() THEN a.id END) as overdue_assignments,
    COUNT(DISTINCT g.id) as total_grades,
    AVG(g.percentage) as average_grade
FROM users u
LEFT JOIN user_courses uc ON u.id = uc.user_id
LEFT JOIN assignments a ON uc.course_id = a.course_id
LEFT JOIN grades g ON u.id = g.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- Create function to get upcoming assignments
CREATE OR REPLACE FUNCTION get_upcoming_assignments(user_uuid UUID, days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    assignment_id UUID,
    assignment_title VARCHAR(255),
    course_name VARCHAR(255),
    platform VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    days_until_due INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as assignment_id,
        a.title as assignment_title,
        c.name as course_name,
        a.platform,
        a.due_date,
        EXTRACT(DAY FROM (a.due_date - NOW()))::INTEGER as days_until_due
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    JOIN user_courses uc ON c.id = uc.course_id
    WHERE uc.user_id = user_uuid
    AND a.due_date BETWEEN NOW() AND NOW() + (days_ahead || ' days')::INTERVAL
    AND a.status != 'completed'
    ORDER BY a.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate course grade
CREATE OR REPLACE FUNCTION calculate_course_grade(course_uuid UUID, user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_weighted_score DECIMAL(10,2) := 0;
    total_weight DECIMAL(5,2) := 0;
    assignment_record RECORD;
BEGIN
    FOR assignment_record IN 
        SELECT a.id, a.weight, g.percentage
        FROM assignments a
        LEFT JOIN grades g ON a.id = g.assignment_id AND g.user_id = user_uuid
        WHERE a.course_id = course_uuid AND a.weight IS NOT NULL
    LOOP
        IF assignment_record.percentage IS NOT NULL THEN
            total_weighted_score := total_weighted_score + (assignment_record.percentage * assignment_record.weight);
        END IF;
        total_weight := total_weight + assignment_record.weight;
    END LOOP;
    
    IF total_weight > 0 THEN
        RETURN (total_weighted_score / total_weight);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql; 