import pg from "pg";
import { env } from "$env/dynamic/private";

// Optional database connection สำหรับ external log-intake server
// สำหรับ K8s pods ที่ไม่มี database จะไม่สร้าง connection
export const db = env.POSTGRES_URL
    ? new pg.Pool({
        connectionString: env.POSTGRES_URL,
        max: 10,
    })
    : null;
