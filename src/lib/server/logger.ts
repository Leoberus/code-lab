import { env } from "$env/dynamic/private";
import { db } from "./db";

export async function logEvent(event: string, payload: Record<string, any>) {
    const entry = {
        event,
        ts: new Date().toISOString(),
        ...payload
    };

    // 1) stdout (ให้ Loki/ELK อนาคต)
    console.log(JSON.stringify(entry));

    // 2) เก็บลง PostgreSQL (K8s pods ทุกตัวส่งมาที่ DB เดียวกัน)
    if (db) {
        try {
            await db.query(
                `INSERT INTO log_events (event, lab_id, problem_id, session_id, ip, user_agent, payload, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    entry.event,
                    payload.labId ?? null,
                    payload.problemId ?? null,
                    payload.sessionId ?? null,
                    payload.ip ?? null,
                    payload.userAgent ?? null,
                    entry,
                    entry.ts
                ]
            );
        } catch (err) {
            console.error("Failed to store log in PostgreSQL:", err);
        }
    } else {
        console.warn("No database connection - logs only in stdout");
    }
}

