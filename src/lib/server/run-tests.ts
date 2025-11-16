import { runCpp } from "$lib/server/run-cpp-core";

export async function execTestCases(code, tests) {
    const results = [];

    for (const t of tests) {
        const result = await runCpp(code, t.input);

        const normalizedOutput = result.stdout.replace(/\r/g, "");
        const normalizedExpected = t.expected.replace(/\r/g, "");

        const passed = normalizedOutput === normalizedExpected;

        results.push({
            id: t.id,
            input: t.input,
            expected: normalizedExpected,
            output: normalizedOutput,
            passed,
            stderr: result.stderr
        });
    }

    return results;
}
