// src/lib/server/session.ts
import type { Cookies } from "@sveltejs/kit";

const COOKIE_NAME = "cplay_session";

export function getOrSetSessionId(cookies: Cookies): string {
    let sid = cookies.get(COOKIE_NAME);
    if (!sid) {
        sid = crypto.randomUUID();
        cookies.set(COOKIE_NAME, sid, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 วัน
        });
    }
    return sid;
}
