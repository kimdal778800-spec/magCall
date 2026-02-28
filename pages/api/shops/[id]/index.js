import mysql from "mysql2/promise";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { id } = req.query;

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

        // is_special 컬럼이 없으면 자동 추가
        const [specialCols] = await conn.execute(
            "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'massage_shops' AND COLUMN_NAME = 'is_special'"
        );
        if (specialCols[0].cnt === 0) {
            await conn.execute("ALTER TABLE massage_shops ADD COLUMN is_special TINYINT(1) DEFAULT 0");
        }

        const [rows] = await conn.execute(
            "SELECT id, name, image, category, theme_type, region, sub_region, phone, telegram, description, is_special FROM massage_shops WHERE id = ? AND is_active = 1",
            [id]
        );
        await conn.end();

        if (rows.length === 0) {
            return res.status(404).json({ message: "업체를 찾을 수 없습니다." });
        }

        return res.status(200).json({ shop: rows[0] });
    } catch (err) {
        console.error("업체 조회 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
