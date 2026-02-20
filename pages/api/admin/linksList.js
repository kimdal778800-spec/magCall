// ✅ /pages/api/admin/linksList.js
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // ✅ JWT 인증 (쿠키 확인)
        // const cookies = cookie.parse(req.headers.cookie || "");
        // const token = cookies.token;
        //
        // if (!token) {
        //     return res.status(401).json({ message: "로그인이 필요합니다." });
        // }
        //
        // let decoded;
        // try {
        //     decoded = jwt.verify(token, process.env.JWT_SECRET);
        // } catch {
        //     return res.status(401).json({ message: "유효하지 않은 세션입니다." });
        // }
        //
        // // ✅ level 확인 (관리자만)
        // if (decoded.level !== 9) {
        //     return res.status(403).json({ message: "관리자만 접근 가능합니다." });
        // }

        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ links 테이블 조회
        const [rows] = await conn.execute(
            "SELECT id, name, url, image, DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt FROM links ORDER BY id DESC"
        );
        await conn.end();

        return res.status(200).json({ links: rows });
    } catch (error) {
        console.error("링크 목록 조회 오류:", error);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
