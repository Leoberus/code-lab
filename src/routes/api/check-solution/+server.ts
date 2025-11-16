import { json } from "@sveltejs/kit";
import { execTestCases } from "$lib/server/run-tests";
import { logEvent } from "$lib/server/logger";
import { getOrSetSessionId } from "$lib/server/session";

export async function POST(event) {
    const { request, getClientAddress, cookies } = event;
    const started = Date.now();
    const ip = getClientAddress();
    const userAgent = request.headers.get("user-agent");
    const sessionId = getOrSetSessionId(cookies);

    try {
        const body = await request.json().catch(() => ({}));
        const { code, tests, labId, problemId } = body;

        if (!code || !tests) {
            await logEvent("check_solution_error", {
                sessionId,
                ip,
                userAgent,
                error: "missing_params",
                hasCode: !!code,
                hasTests: !!tests,
                labId,
                problemId,
            });

            return json({ success: false, message: "Missing code or tests" }, { status: 400 });
        }

        const codeLength = code.length;
        const testCount = Array.isArray(tests) ? tests.length : 0;

        const results = await execTestCases(code, tests);

        const allPassed = results.every(r => r.passed);
        const passedCount = results.filter(r => r.passed).length;
        const duration = Date.now() - started;

        await logEvent("check_solution", {
            sessionId,
            ip,
            userAgent,
            labId,
            problemId,
            codeLength,
            testCount,
            passedCount,
            allPassed,
            duration,
        });

        return json({
            success: true,
            allPassed,
            results
        });

    } catch (err: any) {
        const duration = Date.now() - started;

        await logEvent("check_solution_error", {
            sessionId,
            ip,
            userAgent,
            error: err.message ?? String(err),
            duration,
        });

        return json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
