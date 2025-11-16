# Logging & Analytics Implementation

## Overview

ระบบ logging ถูกออกแบบสำหรับ **K8s deployment** โดยส่ง logs ไปยัง external endpoint เพื่อวิเคราะห์การใช้งาน

## Architecture

```
┌─────────────────────────────────────────┐
│  SvelteKit App (K8s Pods)               │
│  ┌───────────────────────────────────┐  │
│  │ API Endpoints                     │  │
│  │ - /api/run-cpp                    │  │
│  │ - /api/check-solution             │  │
│  │ - /api/teacher                    │  │
│  └────────────┬──────────────────────┘  │
│               │ logEvent()               │
│  ┌────────────▼──────────────────────┐  │
│  │ logger.ts                         │  │
│  │ - console.log (JSON)              │  │
│  │ - fetch to external API           │  │
│  └────────────┬──────────────────────┘  │
└───────────────┼──────────────────────────┘
                │
                ├──────────────────────────┐
                │                          │
                ▼                          ▼
        ┌──────────────┐      ┌─────────────────────┐
        │ stdout       │      │ External Server     │
        │ (Loki/ELK)   │      │ /api/log-intake     │
        └──────────────┘      │                     │
                              │ ┌─────────────────┐ │
                              │ │ PostgreSQL      │ │
                              │ │ log_events      │ │
                              │ └─────────────────┘ │
                              └─────────────────────┘
```

## Logged Events

### 1. Code Execution (`run_cpp`)

**Success:**
```json
{
  "event": "run_cpp",
  "ts": "2025-11-17T10:30:00.000Z",
  "sessionId": "abc123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "labId": "basic-io",
  "problemId": "sum_ab",
  "codeLength": 234,
  "inputLength": 10,
  "success": true,
  "duration": 1234,
  "stage": "run"
}
```

**Error:**
```json
{
  "event": "run_cpp_error",
  "ts": "2025-11-17T10:31:00.000Z",
  "sessionId": "abc123",
  "error": "Compilation failed",
  "stage": "compile",
  "stderr": "error: expected ';' before...",
  "duration": 234
}
```

### 2. Solution Checking (`check_solution`)

**Success:**
```json
{
  "event": "check_solution",
  "ts": "2025-11-17T10:32:00.000Z",
  "sessionId": "abc123",
  "ip": "192.168.1.1",
  "labId": "basic-io",
  "problemId": "sum_ab",
  "codeLength": 234,
  "testCount": 5,
  "passedCount": 5,
  "allPassed": true,
  "duration": 3456
}
```

**Failure:**
```json
{
  "event": "check_solution",
  "testCount": 5,
  "passedCount": 3,
  "allPassed": false,
  "duration": 3200
}
```

**Error:**
```json
{
  "event": "check_solution_error",
  "error": "missing_params",
  "hasCode": true,
  "hasTests": false
}
```

### 3. AI Teacher (`genai_teacher_request`)

**Success:**
```json
{
  "event": "genai_teacher_request",
  "ts": "2025-11-17T10:33:00.000Z",
  "sessionId": "abc123",
  "ip": "192.168.1.1",
  "labId": "basic-io",
  "problemId": "sum_ab",
  "question": "Why is my code not working?",
  "historyLength": 4,
  "codeLength": 234,
  "answer": "You need to check...",
  "tokenUsage": 350,
  "duration": 2345
}
```

**Error:**
```json
{
  "event": "genai_teacher_error",
  "error": "API timeout",
  "statusCode": 504,
  "duration": 30000
}
```

## Usage Analytics Queries

### Problem Difficulty Analysis

```sql
-- หาโจทย์ที่ยากที่สุด (pass rate ต่ำ)
SELECT * FROM v_check_solution_stats 
WHERE total_checks > 10
ORDER BY pass_rate ASC 
LIMIT 10;
```

### Active Users

```sql
-- ผู้ใช้ที่ active ในวันนี้
SELECT 
    COUNT(DISTINCT session_id) as active_users,
    COUNT(*) as total_events
FROM log_events
WHERE created_at::date = CURRENT_DATE;
```

### Popular Problems

```sql
-- โจทย์ที่มีคนทำมากที่สุด
SELECT 
    lab_id,
    problem_id,
    COUNT(DISTINCT session_id) as unique_users,
    COUNT(*) as total_attempts
FROM log_events
WHERE event = 'check_solution'
GROUP BY lab_id, problem_id
ORDER BY unique_users DESC
LIMIT 10;
```

### Error Rate

```sql
-- อัตราการเกิด error
SELECT 
    event,
    COUNT(*) as count
FROM log_events
WHERE event LIKE '%_error'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY event
ORDER BY count DESC;
```

### AI Teacher Usage

```sql
-- การใช้งาน AI Teacher
SELECT 
    DATE(created_at) as date,
    COUNT(*) as questions_asked,
    COUNT(DISTINCT session_id) as unique_users,
    AVG((payload->>'tokenUsage')::numeric) as avg_tokens,
    AVG((payload->>'duration')::numeric) as avg_duration_ms
FROM log_events
WHERE event = 'genai_teacher_request'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### Time to Solve

```sql
-- เวลาเฉลี่ยที่ใช้แก้แต่ละโจทย์
WITH user_attempts AS (
    SELECT 
        session_id,
        problem_id,
        MIN(created_at) as first_attempt,
        MAX(created_at) FILTER (
            WHERE (payload->>'allPassed')::boolean = true
        ) as solved_at
    FROM log_events
    WHERE event = 'check_solution'
    GROUP BY session_id, problem_id
)
SELECT 
    problem_id,
    COUNT(*) as users_who_solved,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (solved_at - first_attempt))) / 60, 
        2
    ) as avg_minutes_to_solve,
    MIN(EXTRACT(EPOCH FROM (solved_at - first_attempt))) / 60 as fastest_minutes,
    MAX(EXTRACT(EPOCH FROM (solved_at - first_attempt))) / 60 as slowest_minutes
FROM user_attempts
WHERE solved_at IS NOT NULL
GROUP BY problem_id
ORDER BY avg_minutes_to_solve DESC;
```

### Compile vs Runtime Errors

```sql
-- เปรียบเทียบ compile error vs runtime error
SELECT 
    payload->>'stage' as stage,
    COUNT(*) as error_count,
    COUNT(DISTINCT session_id) as affected_users
FROM log_events
WHERE event = 'run_cpp_error'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY payload->>'stage'
ORDER BY error_count DESC;
```

### Daily Active Users (DAU)

```sql
-- DAU trend
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as dau,
    COUNT(*) as total_events,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT session_id), 2) as events_per_user
FROM log_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Dashboard Metrics Ideas

### Overview Dashboard
- 📊 Total users (unique sessions)
- 📈 Daily/Weekly/Monthly Active Users
- 🎯 Total problems attempted
- ✅ Total solutions submitted
- 🤖 AI Teacher requests

### Problem Analytics
- 📉 Pass rate per problem
- ⏱️ Average time to solve
- 🔄 Average attempts before success
- 👥 Most/Least popular problems

### Error Analytics
- ⚠️ Compile errors by type
- 🐛 Runtime errors frequency
- 📊 Error rate trend
- 🔍 Common error patterns

### AI Teacher Analytics
- 💬 Questions per day
- 👤 Users using AI Teacher
- 📊 Average token usage
- ⏱️ Response time metrics

### Performance Metrics
- ⚡ Average compilation time
- 🏃 Average execution time
- 📈 System load patterns
- 🌐 Requests per hour

## Development Testing

### Local Development

สำหรับ local dev (ไม่ได้รันบน K8s):
- Logs จะถูกส่งไปยัง external endpoint ตามปกติ
- Console logs จะแสดงใน terminal
- ถ้า external endpoint ไม่พร้อม → silent fail (ไม่กระทบการทำงาน)

### Test Logging

```bash
# ดู logs ใน real-time
kubectl logs -f deployment/codelab-app

# ดูเฉพาะ JSON logs
kubectl logs deployment/codelab-app | grep '{"event"'

# นับจำนวน events แต่ละประเภท
kubectl logs deployment/codelab-app | grep '{"event"' | jq -r '.event' | sort | uniq -c
```

## Environment Variables

```env
# .env file
GENAI_API_KEY=your_api_key_here
```

ไม่ต้องตั้ง `POSTGRES_URL` สำหรับ application pods (เพราะส่ง logs ไปยัง external API)

## Monitoring & Alerts

### Recommended Alerts

1. **High Error Rate**
   ```sql
   -- Alert if error rate > 10% ใน 1 ชั่วโมง
   SELECT 
       COUNT(*) FILTER (WHERE event LIKE '%_error') * 100.0 / 
       NULLIF(COUNT(*), 0) as error_rate
   FROM log_events
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

2. **No Logs Received**
   ```sql
   -- Alert if ไม่มี logs มา 5 นาที
   SELECT MAX(created_at) FROM log_events;
   -- If > 5 minutes ago → alert
   ```

3. **High AI Teacher Error Rate**
   ```sql
   -- Alert if AI errors > 20%
   SELECT 
       COUNT(*) FILTER (WHERE event = 'genai_teacher_error') * 100.0 /
       NULLIF(COUNT(*), 0) as ai_error_rate
   FROM log_events
   WHERE event LIKE 'genai_teacher%'
     AND created_at > NOW() - INTERVAL '1 hour';
   ```

## Future Enhancements

### Phase 1 (Current) ✅
- Basic logging to external API
- Console logs for K8s
- Core analytics queries

### Phase 2 (Planned)
- [ ] Grafana dashboards
- [ ] Loki integration for log aggregation
- [ ] Prometheus metrics
- [ ] Automated alerts

### Phase 3 (Future)
- [ ] Real-time analytics
- [ ] User behavior tracking
- [ ] A/B testing framework
- [ ] Performance optimization based on metrics
