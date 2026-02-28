import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const { name, logo, description } = req.body;

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const sql = `
              INSERT INTO serviceInter (name,description,useYn)
              VALUES (?, ? ,"Y")
            `;
        await conn.execute(sql, [name,description]);
        await conn.end();

        return res.status(200).json({ message: "거래소 소개가 등록되었습니다!" });
    } catch (err) {
        console.error("❌ DB 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
