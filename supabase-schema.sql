-- Enable Row Level Security
-- Note: Supabase handles JWT secrets automatically

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE creditor_status AS ENUM ('approved', 'pending');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'rejected', 'modified');
CREATE TYPE notification_type AS ENUM ('NEW_LOAN_REQUEST', 'LOAN_MODIFIED', 'LOAN_ACCEPTED');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'cash', 'check', 'digital_wallet');
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'JPY');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact_number TEXT,
    address TEXT,
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency currency_type DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Creditors table
CREATE TABLE creditors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    address TEXT,
    notes TEXT,
    status creditor_status DEFAULT 'approved',
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_loans INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan applications table
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creditor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate >= 0),
    purpose TEXT NOT NULL,
    status loan_status DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    credit_history TEXT NOT NULL,
    market_conditions TEXT NOT NULL,
    modified_terms TEXT,
    requires_co_maker BOOLEAN DEFAULT FALSE,
    requires_documents BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_creditors_user_id ON creditors(user_id);
CREATE INDEX idx_loan_applications_applicant_id ON loan_applications(applicant_id);
CREATE INDEX idx_loan_applications_creditor_id ON loan_applications(creditor_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_receiver_id ON payments(receiver_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Creditors policies
CREATE POLICY "Users can manage own creditors" ON creditors
    FOR ALL USING (auth.uid() = user_id);

-- Loan applications policies
CREATE POLICY "Users can view own loan applications" ON loan_applications
    FOR SELECT USING (auth.uid() = applicant_id OR auth.uid() = creditor_id);

CREATE POLICY "Users can create loan applications" ON loan_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Creditors can update loan applications" ON loan_applications
    FOR UPDATE USING (auth.uid() = creditor_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = recipient_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = payer_id OR auth.uid() = receiver_id);

-- Create functions for updated_at timestamps
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

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creditors_updated_at BEFORE UPDATE ON creditors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
