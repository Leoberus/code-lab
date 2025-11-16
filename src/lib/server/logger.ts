import { env } from "$env/dynamic/private";

export async function logEvent(event: string, payload: Record<string, any>) {
    const entry = {
        event,
        ts: new Date().toISOString(),
        ...payload
    };

    // 1) stdout (ให้ Loki/ELK อนาคต)
    console.log(JSON.stringify(entry));

    // 2) ส่งเข้า external storage
    fetch("https://digitech-sandbox.sut.ac.th/c-playground/api/log-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    }).catch(() => { });


}
