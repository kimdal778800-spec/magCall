import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { category, region, sub_region } = req.query;

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // telegram 컬럼이 없으면 자동 추가
        const [telegramCols] = await conn.execute(
            "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'telegram'"
        );
        if (telegramCols[0].cnt === 0) {
            await conn.execute("ALTER TABLE massage_shops ADD COLUMN telegram VARCHAR(100) DEFAULT NULL");
        }

        let query = "SELECT id, name, image, category, theme_type, region, sub_region, phone, telegram FROM massage_shops WHERE is_active = 1";
        const params = [];

        if (category && category !== "all") {
            query += " AND category = ?";
            params.push(category);
        }
        if (region && region !== "all") {
            query += " AND region = ?";
            params.push(region);
        }
        if (sub_region) {
            query += " AND sub_region = ?";
            params.push(sub_region);
        }

        query += " ORDER BY id DESC";

        const [rows] = await conn.execute(query, params);
        await conn.end();

        return res.status(200).json({ shops: rows });
    } catch (err) {
        console.error("업체 목록 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
