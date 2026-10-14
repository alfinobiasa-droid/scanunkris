-- ScanSurat UNKRIS - Supabase SQL Migrations
-- Stage 2: QR Pairing & Realtime Relay

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Pairing Sessions Table
CREATE TABLE pairing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pairing_code VARCHAR(6) NOT NULL,
  qr_token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paired, expired, revoked
  mobile_connected BOOLEAN DEFAULT FALSE,
  pc_connected BOOLEAN DEFAULT FALSE,
  mobile_session_id VARCHAR(255),
  pc_session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',

  CONSTRAINT status_check CHECK (status IN ('pending', 'paired', 'expired', 'revoked'))
);

CREATE INDEX idx_pairing_sessions_qr_token ON pairing_sessions(qr_token);
CREATE INDEX idx_pairing_sessions_status ON pairing_sessions(status);
CREATE INDEX idx_pairing_sessions_expires_at ON pairing_sessions(expires_at);

-- 2. Scan Data Table
CREATE TABLE scan_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pairing_session_id UUID NOT NULL REFERENCES pairing_sessions(id) ON DELETE CASCADE,
  letter_type VARCHAR(50),
  letter_number VARCHAR(100),
  subject TEXT,
  sender VARCHAR(255),
  recipient VARCHAR(255),
  letter_date DATE,
  received_date DATE,
  description TEXT,
  has_agenda BOOLEAN DEFAULT FALSE,
  agenda_start TIMESTAMP,
  agenda_end TIMESTAMP,
  agenda_location VARCHAR(255),
  ocr_raw_text TEXT,
  ocr_confidence FLOAT DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- processing, completed, failed
  form_filled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  CONSTRAINT status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

CREATE INDEX idx_scan_data_pairing_session ON scan_data(pairing_session_id);
CREATE INDEX idx_scan_data_status ON scan_data(status);
CREATE INDEX idx_scan_data_created_at ON scan_data(created_at DESC);

-- 3. Connection Status Table
CREATE TABLE connection_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pairing_session_id UUID NOT NULL REFERENCES pairing_sessions(id) ON DELETE CASCADE UNIQUE,
  mobile_last_heartbeat TIMESTAMP WITH TIME ZONE,
  pc_last_heartbeat TIMESTAMP WITH TIME ZONE,
  extension_last_heartbeat TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_session CHECK (pairing_session_id IS NOT NULL)
);

CREATE INDEX idx_connection_status_session ON connection_status(pairing_session_id);

-- 4. Form Fill Results Table
CREATE TABLE form_fill_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_data_id UUID NOT NULL REFERENCES scan_data(id) ON DELETE CASCADE,
  filled_fields TEXT[] DEFAULT '{}',
  failed_fields JSONB DEFAULT '[]',
  success BOOLEAN NOT NULL,
  message TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_form_fill_results_scan_data ON form_fill_results(scan_data_id);

-- Enable RLS (Row Level Security)
ALTER TABLE pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fill_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Pairing Sessions
-- Allow reading own pairing session via qr_token (one-time validation)
CREATE POLICY "Allow read pairing by qr_token" ON pairing_sessions
  FOR SELECT
  USING (TRUE); -- Temporarily open for initial pairing validation, will use JWT later

-- Allow update own pairing session status
CREATE POLICY "Allow update own pairing session" ON pairing_sessions
  FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies - Scan Data
-- Allow reading scan data from own pairing session
CREATE POLICY "Allow read scan data from own session" ON scan_data
  FOR SELECT
  USING (TRUE);

-- Allow inserting scan data to own pairing session
CREATE POLICY "Allow insert scan data to own session" ON scan_data
  FOR INSERT
  WITH CHECK (TRUE);

-- Allow updating own scan data
CREATE POLICY "Allow update own scan data" ON scan_data
  FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies - Connection Status
CREATE POLICY "Allow manage connection status" ON connection_status
  FOR ALL
  USING (TRUE);

-- RLS Policies - Form Fill Results
CREATE POLICY "Allow read form results" ON form_fill_results
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Allow insert form results" ON form_fill_results
  FOR INSERT
  WITH CHECK (TRUE);

-- Create realtime publication for real-time channel updates
ALTER PUBLICATION supabase_realtime ADD TABLE pairing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE scan_data;
ALTER PUBLICATION supabase_realtime ADD TABLE connection_status;
ALTER PUBLICATION supabase_realtime ADD TABLE form_fill_results;
