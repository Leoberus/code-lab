-- Schema for log_events table
-- สำหรับเก็บ logs ทุกประเภทจากระบบ C++ Lab

CREATE TABLE IF NOT EXISTS log_events (
    id SERIAL PRIMARY KEY,
    event VARCHAR(100) NOT NULL,
    lab_id VARCHAR(100),
    problem_id VARCHAR(100),
    session_id VARCHAR(100),
    ip VARCHAR(45),
    user_agent TEXT,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes สำหรับ query ที่ใช้บ่อย
CREATE INDEX IF NOT EXISTS idx_log_events_event ON log_events(event);
CREATE INDEX IF NOT EXISTS idx_log_events_session_id ON log_events(session_id);
CREATE INDEX IF NOT EXISTS idx_log_events_lab_id ON log_events(lab_id);
CREATE INDEX IF NOT EXISTS idx_log_events_problem_id ON log_events(problem_id);
CREATE INDEX IF NOT EXISTS idx_log_events_created_at ON log_events(created_at DESC);

-- Index สำหรับ JSONB queries
CREATE INDEX IF NOT EXISTS idx_log_events_payload ON log_events USING GIN(payload);

-- View สำหรับดูสถิติการใช้งานแต่ละโจทย์
CREATE OR REPLACE VIEW v_problem_stats AS
SELECT 
    lab_id,
    problem_id,
    event,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_users,
    DATE(created_at) as date
FROM log_events
WHERE problem_id IS NOT NULL
GROUP BY lab_id, problem_id, event, DATE(created_at)
ORDER BY date DESC, event_count DESC;

-- View สำหรับดูอัตราการผ่าน test cases
CREATE OR REPLACE VIEW v_check_solution_stats AS
SELECT 
    lab_id,
    problem_id,
    COUNT(*) as total_checks,
    COUNT(*) FILTER (WHERE (payload->>'allPassed')::boolean = true) as passed_checks,
    COUNT(*) FILTER (WHERE (payload->>'allPassed')::boolean = false) as failed_checks,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE (payload->>'allPassed')::boolean = true) / 
        NULLIF(COUNT(*), 0),
        2
    ) as pass_rate,
    COUNT(DISTINCT session_id) as unique_users,
    AVG((payload->>'duration')::numeric) as avg_duration_ms
FROM log_events
WHERE event = 'check_solution'
GROUP BY lab_id, problem_id
ORDER BY total_checks DESC;

-- View สำหรับดูการใช้งาน AI Teacher
CREATE OR REPLACE VIEW v_ai_teacher_stats AS
SELECT 
    lab_id,
    problem_id,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE event = 'genai_teacher_error') as error_count,
    AVG((payload->>'duration')::numeric) as avg_duration_ms,
    AVG((payload->>'tokenUsage')::numeric) as avg_token_usage,
    COUNT(DISTINCT session_id) as unique_users,
    DATE(created_at) as date
FROM log_events
WHERE event IN ('genai_teacher_request', 'genai_teacher_error')
GROUP BY lab_id, problem_id, DATE(created_at)
ORDER BY date DESC, total_requests DESC;

-- View สำหรับดูสถิติการ compile และ run
CREATE OR REPLACE VIEW v_code_execution_stats AS
SELECT 
    lab_id,
    problem_id,
    event,
    COUNT(*) as total_runs,
    COUNT(*) FILTER (WHERE (payload->>'success')::boolean = true) as success_count,
    COUNT(*) FILTER (WHERE (payload->>'success')::boolean = false) as fail_count,
    COUNT(*) FILTER (WHERE payload->>'timedOut' = 'true') as timeout_count,
    AVG((payload->>'duration')::numeric) as avg_duration_ms,
    COUNT(DISTINCT session_id) as unique_users,
    DATE(created_at) as date
FROM log_events
WHERE event IN ('run_cpp', 'run_cpp_error')
GROUP BY lab_id, problem_id, event, DATE(created_at)
ORDER BY date DESC, total_runs DESC;
