import mysql from "mysql2/promise"; // ✅ promise 기반으로 변경

export default async function handler(req, res) {
    try {
        const { id } = req.query;

        // ✅ ID 유효성 검사
        const numericId = Number(id);
        if (!numericId) {
            return res.status(400).json({ success: false, message: "Invalid id" });
        }

        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ DB 조회
        const [rows] = await conn.execute(
            "SELECT * FROM serviceInter WHERE id =  (select max(id) from serviceInter)",
            [numericId]
        );


        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "데이터 없음" });
        }

        // ✅ 정상 응답
        return res.status(200).json({ success: true, serviceInter: rows[0] });
    } catch (err) {
        console.error("❌ DB 조회 오류:", err);
        return res
            .status(500)
            .json({ success: false, message: "서버 오류가 발생했습니다." });
    }
}
