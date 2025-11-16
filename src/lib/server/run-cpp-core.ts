import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const RUN_TIMEOUT_MS = 3000;
const COMPILE_TIMEOUT_MS = 8000;

async function runWithTimeout(
    cmd: string,
    args: string[],
    options: { cwd?: string; input?: string; timeout: number }
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { cwd: options.cwd });

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

        child.stdout.on("data", (d) => (stdout += d.toString()));
        child.stderr.on("data", (d) => (stderr += d.toString()));

        child.on("close", (code) => {
            clearTimeout(timer);
            if (finished) return;
            finished = true;
            resolve({ stdout, stderr, exitCode: code, timedOut });
        });

        if (options.input) child.stdin.write(options.input);
        child.stdin.end();
    });
}

export async function runCpp(code: string, input: string = "") {
    // 1) create temporary workspace
    const dir = await mkdtemp(join(tmpdir(), "cpp-"));
    const sourcePath = join(dir, "main.cpp");
    const binaryPath = join(dir, "main.out");

    await writeFile(sourcePath, code, "utf-8");

    // 2) compile
    const compile = await runWithTimeout(
        "g++",
        ["-std=c++17", "-O2", sourcePath, "-o", binaryPath],
        { cwd: dir, timeout: COMPILE_TIMEOUT_MS }
    );

    if (compile.timedOut) {
        return {
            stage: "compile",
            success: false,
            stdout: "",
            stderr: "Compile timeout"
        };
    }

    if (compile.exitCode !== 0) {
        return {
            stage: "compile",
            success: false,
            stdout: compile.stdout,
            stderr: compile.stderr
        };
    }

    // 3) run compiled program
    const run = await runWithTimeout(binaryPath, [], {
        cwd: dir,
        timeout: RUN_TIMEOUT_MS,
        input
    });

    return {
        stage: "run",
        success: !run.timedOut && run.exitCode === 0,
        stdout: run.stdout,
        stderr: run.stderr,
        exitCode: run.exitCode,
        timedOut: run.timedOut
    };
}
