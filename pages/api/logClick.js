import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { linkId } = req.body;
        if (!linkId) {
            return res.status(400).json({ message: "linkId가 누락되었습니다." });
        }

        // ✅ JWT에서 사용자 이메일 추출 (로그인 안 되어도 null 가능)
        let userEmail = null;
        try {
            const cookies = cookie.parse(req.headers.cookie || "");
            const token = cookies.token;
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userEmail = decoded.email || null;
            }
        } catch {
            userEmail = null;
        }

        // ✅ DB 저장
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        await conn.execute(
            "INSERT INTO linkClicks (linkId, userEmail) VALUES (?, ?)",
            [Number(linkId), userEmail]
        );

        await conn.end();

        return res.status(200).json({ message: "클릭 로그 기록 완료" });
    } catch (err) {
        console.error("❌ 클릭 로그 저장 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
