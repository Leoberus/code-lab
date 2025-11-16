// src/lib/server/logger.ts
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const LOG_FILE = process.env.LOG_FILE ?? "logs/events.log";

async function ensureLogDir() {
    const dir = dirname(LOG_FILE);
    await mkdir(dir, { recursive: true });
}

export async function logEvent(
    type: string,
    payload: Record<string, unknown> = {},
) {
    try {
        await ensureLogDir();

        const row = {
            ts: new Date().toISOString(),
            type,
            ...payload,
        };

        await appendFile(LOG_FILE, JSON.stringify(row) + "\n", "utf-8");
    } catch (err) {
        // อย่าให้ logging ทำให้ request ล้ม
        console.error("logEvent error:", err);
    }
}
