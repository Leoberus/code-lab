import pg from "pg";
import { POSTGRES_URL } from "$env/static/private";

export const db = new pg.Pool({
    connectionString: POSTGRES_URL,
    max: 10,
});
