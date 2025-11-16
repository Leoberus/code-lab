# Database & Logging Setup Guide

## Architecture Overview

เนื่องจากระบบรันบน **Kubernetes (K8s)** จึงไม่สามารถเก็บ logs ใน local database ของแต่ละ pod ได้ 

### Logging Flow:

```
Application (K8s Pods)
    ↓
    ├─→ stdout/console.log ────→ Loki/ELK (อนาคต)
    └─→ External API ──────────→ Central PostgreSQL
         /api/log-intake
```

## Implementation Summary

### Files Modified for Logging:

1. **`src/lib/server/logger.ts`**
   - ฟังก์ชัน `logEvent()` สำหรับ log ทุก event
   - ส่งไปทั้ง console และ external API

2. **`src/routes/api/run-cpp/+server.ts`**
   - Log events: `run_cpp`, `run_cpp_error`
   - บันทึก compile/run results, duration, code metrics

3. **`src/routes/api/teacher/+server.ts`**
   - Log events: `genai_teacher_request`, `genai_teacher_error`
   - บันทึกการใช้ AI, token usage, duration

4. **`src/routes/api/check-solution/+server.ts`**
   - Log events: `check_solution`, `check_solution_error`
   - บันทึกผลการตรวจ, test pass rate

5. **`src/routes/api/log-intake/+server.ts`**
   - External API endpoint สำหรับรับ logs
   - เก็บลง PostgreSQL

## Log Storage

Logs จะถูกส่งไปยัง **External Endpoint**:
- URL: `https://digitech-sandbox.sut.ac.th/c-playground/api/log-intake`
- Method: POST
- ข้อมูลจะถูกเก็บใน PostgreSQL ที่ external server

## External Log Intake API

API endpoint `/api/log-intake` จะรับข้อมูลและเก็บลง PostgreSQL:

### Request Format
```json
{
  "event": "run_cpp",
  "ts": "2025-11-17T10:30:00.000Z",
  "sessionId": "abc123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "labId": "basic-io",
  "problemId": "sum_ab",
  "duration": 1234,
  "success": true
  // ... other fields
}
```

## Schema Overview

### ตาราง `log_events` (บน External Server)

เก็บ logs ทุกประเภทจากระบบ:

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| event | VARCHAR(100) | ชนิดของ event (run_cpp, check_solution, etc.) |
| lab_id | VARCHAR(100) | ID ของ lab |
| problem_id | VARCHAR(100) | ID ของโจทย์ |
| session_id | VARCHAR(100) | Session ID ของผู้ใช้ |
| ip | VARCHAR(45) | IP address |
| user_agent | TEXT | Browser user agent |
| payload | JSONB | ข้อมูลทั้งหมดในรูป JSON |
| created_at | TIMESTAMPTZ | เวลาที่สร้าง log |

### Event Types ที่บันทึก

| Event | Description | Key Fields |
|-------|-------------|------------|
| `run_cpp` | รันโค้ด C++ สำเร็จ | `success`, `duration`, `codeLength` |
| `run_cpp_error` | เกิด error ตอน compile/run | `error`, `stage`, `stderr` |
| `check_solution` | ตรวจคำตอบ | `testCount`, `passedCount`, `allPassed` |
| `check_solution_error` | Error ตอนตรวจคำตอบ | `error`, `hasCode`, `hasTests` |
| `genai_teacher_request` | ถาม AI Teacher | `question`, `historyLength`, `tokenUsage` |
| `genai_teacher_error` | Error จาก AI Teacher | `error`, `statusCode` |

### Views สำหรับ Analytics

#### `v_problem_stats`
สถิติการใช้งานแต่ละโจทย์รายวัน

```sql
SELECT * FROM v_problem_stats 
WHERE problem_id = 'sum_ab' 
ORDER BY date DESC;
```

#### `v_check_solution_stats`
อัตราการผ่าน test cases แต่ละโจทย์

```sql
SELECT * FROM v_check_solution_stats 
ORDER BY pass_rate ASC;  -- หาโจทย์ที่ยากที่สุด
```

#### `v_ai_teacher_stats`
สถิติการใช้งาน AI Teacher

```sql
SELECT * FROM v_ai_teacher_stats 
WHERE date = CURRENT_DATE;
```

#### `v_code_execution_stats`
สถิติการ compile และ run code

```sql
SELECT * FROM v_code_execution_stats 
WHERE event = 'run_cpp_error'  -- หา common errors
ORDER BY fail_count DESC;
```

## Example Queries

### หาโจทย์ที่มีคนทำมากที่สุด

```sql
SELECT 
    problem_id,
    COUNT(DISTINCT session_id) as unique_users,
    COUNT(*) as total_attempts
FROM log_events
WHERE event = 'check_solution'
GROUP BY problem_id
ORDER BY unique_users DESC
LIMIT 10;
```

### หา session ที่ active ล่าสุด

```sql
SELECT 
    session_id,
    COUNT(*) as events,
    MAX(created_at) as last_activity
FROM log_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY session_id
ORDER BY last_activity DESC;
```

### ดู error patterns

```sql
SELECT 
    event,
    payload->>'error' as error_type,
    COUNT(*) as count
FROM log_events
WHERE event LIKE '%_error'
GROUP BY event, payload->>'error'
ORDER BY count DESC;
```

### วิเคราะห์เวลาที่ใช้แก้โจทย์

```sql
WITH user_attempts AS (
    SELECT 
        session_id,
        problem_id,
        MIN(created_at) as first_attempt,
        MAX(created_at) FILTER (WHERE (payload->>'allPassed')::boolean = true) as solved_at
    FROM log_events
    WHERE event = 'check_solution'
    GROUP BY session_id, problem_id
)
SELECT 
    problem_id,
    COUNT(*) as users_who_solved,
    AVG(EXTRACT(EPOCH FROM (solved_at - first_attempt))) / 60 as avg_minutes_to_solve
FROM user_attempts
WHERE solved_at IS NOT NULL
GROUP BY problem_id
ORDER BY avg_minutes_to_solve DESC;
```

## Maintenance

### สำหรับ External Server Admin

### ลบ logs เก่า (เก็บแค่ 90 วันล่าสุด)

```sql
DELETE FROM log_events 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### ดูขนาด database

```sql
SELECT 
    pg_size_pretty(pg_database_size('codelab')) as db_size,
    pg_size_pretty(pg_relation_size('log_events')) as table_size;
```

### Vacuum และ analyze (รันเป็นระยะเพื่อ performance)

```sql
VACUUM ANALYZE log_events;
```

## Monitoring

### ตรวจสอบว่า logs กำลังเข้าระบบ

```sql
-- ดู logs ล่าสุด
SELECT * FROM log_events 
ORDER BY created_at DESC 
LIMIT 10;

-- นับ events ในวันนี้
SELECT 
    event,
    COUNT(*) as count,
    COUNT(DISTINCT session_id) as unique_users
FROM log_events
WHERE created_at::date = CURRENT_DATE
GROUP BY event
ORDER BY count DESC;
```

### Alert ถ้ามี error เยอะ

```sql
-- นับ errors ใน 1 ชั่วโมงล่าสุด
SELECT 
    event,
    COUNT(*) as error_count
FROM log_events
WHERE event LIKE '%_error'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY event
ORDER BY error_count DESC;
```

## Troubleshooting

### ถ้า logs ไม่เข้า external database

1. **ตรวจสอบ external endpoint ทำงานหรือไม่**:
   ```bash
   curl -X POST https://digitech-sandbox.sut.ac.th/c-playground/api/log-intake \
     -H "Content-Type: application/json" \
     -d '{"event":"test","ts":"2025-11-17T10:00:00.000Z","test":true}'
   ```

2. **ดู console logs ของ K8s pods**:
   ```bash
   kubectl logs -f <pod-name>
   # จะเห็น JSON logs ที่ print ออกมา
   ```

3. **ตรวจสอบว่า external server มี table `log_events`**:
   ```sql
   -- บน external server
   \dt log_events
   ```

4. **ตรวจสอบ network/firewall**: 
   - Pod ต้องสามารถเข้าถึง external URL ได้
   - ตรวจสอบ K8s NetworkPolicy
   - ตรวจสอบว่า external server เปิด port ให้ K8s cluster

### ถ้า fetch ไป external ล้มเหลว

- Application จะ silent fail (`.catch(() => { })`)
- ไม่กระทบการทำงานของ application
- แต่ยัง log ออกทาง `console.log` อยู่ → สามารถใช้ Loki/ELK รวบรวมได้

### Alternative: ใช้ Loki/Prometheus

ถ้า external endpoint ไม่พร้อม สามารถเก็บ logs ผ่าน:
1. **Loki** - รวบรวม logs จาก K8s pods (stdout)
2. **Prometheus** - สำหรับ metrics
3. **Grafana** - แสดงผล dashboard

## K8s Deployment Considerations

### Environment Variables

```yaml
# deployment.yaml
env:
  - name: GENAI_API_KEY
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: genai-api-key
```

### Resource Limits

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```
