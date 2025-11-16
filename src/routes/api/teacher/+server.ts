// src/routes/api/teacher/+server.ts
import { json } from "@sveltejs/kit";
import { logEvent } from "$lib/server/logger";
import { getOrSetSessionId } from "$lib/server/session";

const GENAI_URL = "https://demo-genai.sut.ac.th/api/chat/completions";
const MODEL = "openai/gpt-4o-mini"; // ถ้า endpoint นี้ใช้ชื่ออื่น เปลี่ยนตามจริงได้เลย
const MAX_HISTORY = 8; // memory: เก็บประวัติแชทล่าสุด 8 ข้อความ

export async function POST(event) {
    const { request, getClientAddress, cookies } = event;
    const started = Date.now();
    const ip = getClientAddress();
    const userAgent = request.headers.get("user-agent");

    const apiKey = process.env.GENAI_API_KEY;
    if (!apiKey) {
        console.error("Missing GENAI_API_KEY");
        await logEvent("teacher_chat", {
            success: false,
            stage: "validate",
            reason: "missing_api_key",
            durationMs: Date.now() - started,
            ip,
            userAgent,
        });
        return json(
            { success: false, message: "Server config error: missing API key" },
            { status: 500 },
        );
    }


    const body = await request.json().catch(() => ({}));
    const {
        labId,
        labTitle,
        problemId,
        problemTitle,
        problemDescription,
        code,
        consoleOutput,
        consoleError,
        messages,
    } = body;

    const sessionId = getOrSetSessionId(cookies);

    const question =
        Array.isArray(messages) && messages.length
            ? messages[messages.length - 1]?.text ?? ""
            : "";


    // messages จากฝั่ง client เป็น [{role:"student"|"teacher", text:string}]
    const chatHistory = Array.isArray(messages) ? messages : [];

    // จำกัด memory
    const trimmed = chatHistory.slice(-MAX_HISTORY);

    const systemPrompt = `
You are "AI C++ Coding Teacher" for university students.

Goals:
- ช่วยนักศึกษาเข้าใจ logic และแนวคิดของโค้ด ไม่ใช่แค่ลอกคำตอบ
- ตอบแบบ Socratic: ถามนำ, ให้ hint ทีละขั้น, ชวนคิดเอง
- ห้ามพิมพ์คำตอบโค้ดเต็ม ๆ ทั้งฟังก์ชัน หรือทั้งโปรแกรม เว้นแต่ผู้สอน (มนุษย์) ระบุให้ออกข้อสอบเฉลยได้
- ถ้าจะยกตัวอย่างโค้ด ให้ใช้ code snippet สั้น ๆ เฉพาะส่วนสำคัญ ไม่ใช่ทั้งโปรแกรม

Context:
- Lab: ${labTitle} (id: ${labId})
- Problem: ${problemTitle} (id: ${problemId})
- Problem description (โจทย์): 
${problemDescription}

- Student's current code:

\`\`\`cpp
${code ?? ""}
\`\`\`

- Last run result:
stdout:
${consoleOutput ?? "(empty)"}

stderr:
${consoleError ?? "(empty)"}

หลักการตอบ:
1) ประเมินก่อนว่าโค้ดของนักศึกษาตอนนี้ "ใกล้" หรือ "ไกล" จากคำตอบที่ถูก
2) ถ้ามี error ใน stderr ให้ช่วยอธิบาย error แบบเข้าใจง่าย + ชี้ตำแหน่งคร่าว ๆ
3) ถ้า logic ยังไม่ตรง ให้ถามนำ เช่น "ตอนนี้โค้ดรองรับกรณี ... แล้วหรือยัง?"
4) สลับใช้ภาษาไทย/อังกฤษได้ แต่ default เป็นภาษาไทย (technical term เป็นอังกฤษได้)
5) สรุปตอนท้ายว่า "ลองแก้ขั้นต่อไปอะไร" 1–3 ข้อ
`.trim();

    // แปลงเป็นรูปแบบ messages ของ API แบบ OpenAI-compatible
    const apiMessages = [
        {
            role: "system",
            content: systemPrompt,
        },
        ...trimmed.map((m: any) => ({
            role: m.role === "student" ? "user" : "assistant",
            content: m.text ?? "",
        })),
    ];

    try {
        const res = await fetch(GENAI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: apiMessages,
                temperature: 0.5,
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("GenAI error:", res.status, errText);
            await logEvent("teacher_chat", {
                success: false,
                stage: "upstream",
                reason: "non_2xx",
                durationMs: Date.now() - started,
                labId,
                problemId,
                messageCount: trimmed.length,
                questionLength: question.length,
                status: res.status,
                detail: errText.slice(0, 1000),
                ip,
                userAgent,
                sessionId,
            });
            return json(
                {
                    success: false,
                    message: "Upstream AI error",
                    detail: errText,
                },
                { status: 500 },
            );
        }

        const data = await res.json();

        // รองรับโครงสร้างแบบ OpenAI
        const reply =
            data?.choices?.[0]?.message?.content ??
            "ขอโทษครับ ตอนนี้ไม่สามารถประมวลผลคำตอบได้";

        await logEvent("teacher_chat", {
            success: true,
            stage: "reply",
            durationMs: Date.now() - started,
            labId,
            labTitle,
            problemId,
            problemTitle,
            messageCount: trimmed.length,
            questionLength: question.length,
            codeLength: (code ?? "").length,
            consoleOutputLength: (consoleOutput ?? "").length,
            consoleErrorLength: (consoleError ?? "").length,
            replyLength: reply.length,
            ip,
            userAgent,
            sessionId,
        });

        return json({
            success: true,
            reply,
        });
    } catch (err: any) {
        console.error("Teacher API error:", err);
        await logEvent("teacher_chat", {
            success: false,
            stage: "server",
            error: String(err),
            durationMs: Date.now() - started,
            labId,
            problemId,
            messageCount: trimmed.length,
            questionLength: question.length,
            ip,
            userAgent,
            sessionId,
        });
        return json(
            {
                success: false,
                message: "Teacher API request failed",
            },
            { status: 500 },
        );
    }
}
