import mysql from "mysql2/promise";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

async function getConn() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });
    // 테이블 없으면 자동 생성
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS shop_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shop_id INT NOT NULL,
            user_id INT NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    return conn;
}

function getUser(req) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        if (!cookies.token) return null;
        return jwt.verify(cookies.token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    const { id } = req.query;

    // GET - 댓글 목록
    if (req.method === "GET") {
        try {
            const conn = await getConn();
            const [rows] = await conn.execute(
                "SELECT id, user_name, content, created_at FROM shop_comments WHERE shop_id = ? ORDER BY created_at DESC",
                [id]
            );
            await conn.end();
            return res.status(200).json({ comments: rows });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "서버 오류" });
        }
    }

    // POST - 댓글 작성
    if (req.method === "POST") {
        const user = getUser(req);
        if (!user) return res.status(401).json({ message: "로그인이 필요합니다." });

        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "내용을 입력해주세요." });
        }
        if (content.trim().length > 500) {
            return res.status(400).json({ message: "댓글은 500자 이내로 작성해주세요." });
        }

        try {
            const conn = await getConn();
            await conn.execute(
                "INSERT INTO shop_comments (shop_id, user_id, user_name, content) VALUES (?, ?, ?, ?)",
                [id, user.id, user.name || user.email, content.trim()]
            );
            await conn.end();
            return res.status(200).json({ message: "댓글이 등록되었습니다." });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "서버 오류" });
        }
    }

    // DELETE - 댓글 삭제 (본인 또는 관리자)
    if (req.method === "DELETE") {
        const user = getUser(req);
        if (!user) return res.status(401).json({ message: "로그인이 필요합니다." });

        const { commentId } = req.body;
        if (!commentId) return res.status(400).json({ message: "잘못된 요청입니다." });

        try {
            const conn = await getConn();
            const [rows] = await conn.execute("SELECT user_id FROM shop_comments WHERE id = ?", [commentId]);
            if (rows.length === 0) {
                await conn.end();
                return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
            }
            if (rows[0].user_id !== user.id && Number(user.level) !== 99) {
                await conn.end();
                return res.status(403).json({ message: "삭제 권한이 없습니다." });
            }
            await conn.execute("DELETE FROM shop_comments WHERE id = ?", [commentId]);
            await conn.end();
            return res.status(200).json({ message: "삭제되었습니다." });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "서버 오류" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
