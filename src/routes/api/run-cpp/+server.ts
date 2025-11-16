import { json } from "@sveltejs/kit";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { logEvent } from "$lib/server/logger";
import { getOrSetSessionId } from "$lib/server/session";

const RUN_TIMEOUT_MS = 3000;   // จำกัดเวลารัน 3 วินาที
const COMPILE_TIMEOUT_MS = 8000;


async function runWithTimeout(
    cmd: string,
    args: string[],
    options: { cwd?: string; input?: string; timeout: number }
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd: options.cwd,
        });

        let stdout = "";
        let stderr = "";
        let finished = false;
        let timedOut = false;

        const timer = setTimeout(() => {
            if (!finished) {
                timedOut = true;
                child.kill("SIGKILL");
            }
        }, options.timeout);

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", (err) => {
            clearTimeout(timer);
            if (finished) return;
            finished = true;
            reject(err);
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            if (finished) return;
            finished = true;
            resolve({ stdout, stderr, exitCode: code, timedOut });
        });

        if (options.input) {
            child.stdin.write(options.input);
        }
        child.stdin.end();
    });
}

export async function POST(event) {
    const { request, getClientAddress, cookies } = event;
    const started = Date.now();
    const ip = getClientAddress();
    const userAgent = request.headers.get("user-agent");
    const sessionId = getOrSetSessionId(cookies);

    try {
        const body = await request.json().catch(() => ({}));
        const code: string = body.code ?? "";
        const input: string = body.input ?? "";
        const labId: string | undefined = body.labId;
        const problemId: string | undefined = body.problemId;
        const codeLength = code.length;
        const inputLength = input.length;

        if (!code.trim()) {
            await logEvent("run_cpp", {
                labId,
                problemId,
                success: false,
                stage: "validate",
                reason: "empty_code",
                durationMs: Date.now() - started,
                codeLength: 0,
                inputLength: 0,
                ip,
                userAgent,
                sessionId,
            });

            return json(
                { success: false, stage: "validate", message: "Code is empty." },
                { status: 400 },
            );
        }

        // สร้างโฟลเดอร์ temp
        const tempDir = await mkdtemp(join(tmpdir(), "cpp-"));
        const sourcePath = join(tempDir, "main.cpp");
        const binaryPath = join(tempDir, "main.out");

        // เขียนไฟล์โค้ด
        await writeFile(sourcePath, code, "utf-8");

        // ขั้นตอน 1: Compile
        const compileResult = await runWithTimeout(
            "g++",
            ["-std=c++17", "-O2", sourcePath, "-o", binaryPath],
            { cwd: tempDir, timeout: COMPILE_TIMEOUT_MS }
        );

        if (compileResult.timedOut) {
            await logEvent("run_cpp", {
                labId,
                problemId,
                success: false,
                stage: "compile",
                reason: "timeout",
                durationMs: Date.now() - started,
                codeLength,
                inputLength,
                stderrLen: compileResult.stderr.length,
                timedOut: true,
                ip,
                userAgent,
                sessionId,
            });
            return json(
                {
                    success: false,
                    stage: "compile",
                    message: "Compile timeout.",
                    stderr: compileResult.stderr,
                },
                { status: 400 }
            );
        }

        if (compileResult.exitCode !== 0) {
            await logEvent("run_cpp", {
                labId,
                problemId,
                success: false,
                stage: "compile",
                reason: "compile_error",
                durationMs: Date.now() - started,
                codeLength,
                inputLength,
                stderrLen: compileResult.stderr.length,
                exitCode: compileResult.exitCode,
                ip,
                userAgent,
                sessionId,
            });
            return json(
                {
                    success: false,
                    stage: "compile",
                    message: "Compile error.",
                    stderr: compileResult.stderr,
                },
                { status: 400 }
            );
        }

        // ขั้นตอน 2: Run binary
        const runResult = await runWithTimeout(binaryPath, [], {
            cwd: tempDir,
            timeout: RUN_TIMEOUT_MS,
            input,
        });

        if (runResult.timedOut) {
            await logEvent("run_cpp", {
                labId,
                problemId,
                success: false,
                stage: "run",
                reason: "timeout",
                durationMs: Date.now() - started,
                codeLength,
                inputLength,
                stdoutLen: runResult.stdout.length,
                stderrLen: runResult.stderr.length,
                timedOut: true,
                ip,
                userAgent,
                sessionId,
            });
            return json(
                {
                    success: false,
                    stage: "run",
                    message: "Runtime timeout.",
                    stdout: runResult.stdout,
                    stderr: runResult.stderr,
                },
                { status: 400 }
            );
        }
        const duration = Date.now() - started;
        await logEvent("run_cpp", {
            labId,
            problemId,
            success: true,
            stage: "run",
            durationMs: duration,
            codeLength,
            inputLength,
            stdoutLen: runResult.stdout.length,
            stderrLen: runResult.stderr.length,
            consoleHasError: !!runResult.stderr,
            exitCode: runResult.exitCode,
            ip,
            userAgent,
            sessionId,
        });

        return json({
            success: true,
            stage: "run",
            stdout: runResult.stdout,
            stderr: runResult.stderr,
            exitCode: runResult.exitCode,
        });
    } catch (err: any) {
        const duration = Date.now() - started;

        await logEvent("run_cpp", {
            success: false,
            stage: "server",
            error: String(err),
            durationMs: duration,
            labId: undefined,
            problemId: undefined,
            ip,
            userAgent,
            sessionId,
        });

        return json(
            {
                success: false,
                stage: "server",
                message: "Internal server error.",
            },
            { status: 500 },
        );
    }
}
