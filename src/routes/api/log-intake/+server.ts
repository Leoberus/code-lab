import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export async function POST({ request }) {
    try {
        const body = await request.json();

        await db.query(
            `INSERT INTO log_events (event, lab_id, problem_id, session_id, ip, user_agent, payload)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                body.event,
                body.labId ?? null,
                body.problemId ?? null,
                body.sessionId ?? null,
                body.ip ?? null,
                body.userAgent ?? null,
                body
            ]
        );

        return json({ ok: true });
    } catch (err) {
        console.error("log-intake error", err);
        return json({ ok: false, error: "store_failed" }, { status: 500 });
    }
}
