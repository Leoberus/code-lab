import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export async function POST({ request }) {
    try {
        const body = await request.json();

        // ถ้าไม่มี database connection (K8s pods) ให้ skip
        // endpoint นี้จะใช้งานเฉพาะบน external log-intake server เท่านั้น
        if (!db) {
            console.warn("log-intake: No database connection configured");
            return json({ ok: false, error: "no_db_configured" }, { status: 503 });
        }

        await db.query(
            `INSERT INTO log_events (event, lab_id, problem_id, session_id, ip, user_agent, payload, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
                body.event,
                body.labId ?? null,
                body.problemId ?? null,
                body.sessionId ?? null,
                body.ip ?? null,
                body.userAgent ?? null,
                body,
                body.ts ?? new Date().toISOString()
            ]
        );

        return json({ ok: true });
    } catch (err) {
        console.error("log-intake error", err);
        return json({ ok: false, error: "store_failed" }, { status: 500 });
    }
}

