import mysql from "mysql2/promise";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const { id, name, logo, rate, discount, fee1, fee2, tag, description } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID가 필요합니다." });
        }

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ description 필드 추가
        const [result] = await conn.execute(
            `
            UPDATE partnerExchanges 
            SET 
                name = ?, 
                logo = ?, 
                rate = ?, 
                discount = ?, 
                fee1 = ?, 
                fee2 = ?, 
                tag = ?, 
                description = ? 
            WHERE id = ?
            `,
            [name, logo, rate, discount, fee1, fee2, tag, description, id]
        );

        await conn.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "해당 거래소를 찾을 수 없습니다." });
        }

        return res.status(200).json({ message: "거래소 수정 완료" });
    } catch (err) {
        console.error("❌ DB 수정 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
