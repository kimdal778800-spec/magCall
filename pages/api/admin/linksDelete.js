// ✅ /pages/api/admin/linksDelete.js
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    try {
        const { ids } = req.body; // 배열 형태 [1, 2, 3]
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "삭제할 항목이 없습니다." });
        }

        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ 삭제 전 이미지 파일 경로 조회
        const [rows] = await conn.query(
            `SELECT image FROM links WHERE id IN (${ids.map(() => "?").join(",")})`,
            ids
        );

        // ✅ 파일 삭제
        for (const row of rows) {
            const filePath = path.join(process.cwd(), "public", row.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // ✅ DB에서 항목 삭제
        await conn.query(
            `DELETE FROM links WHERE id IN (${ids.map(() => "?").join(",")})`,
            ids
        );
        await conn.end();

        return res.status(200).json({ message: "삭제 완료" });
    } catch (error) {
        console.error("삭제 오류:", error);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
