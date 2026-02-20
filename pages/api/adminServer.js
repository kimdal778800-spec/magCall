import mysql from "mysql2/promise";


async function startServer() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        console.log("✅ MySQL 연결 성공");

        // API 라우트 정의
        app.get("/api/dashboard", async (req, res) => {
            try {
                const [rows] = await db.query("SELECT * FROM dashboard_data");
                res.json(rows);
            } catch (err) {
                console.error("데이터 조회 실패:", err);
                res.status(500).send("서버 오류");
            }
        });

        app.get("/api/users", async (req, res) => {
            try {
                const [rows] = await db.query("SELECT * FROM users");
                res.json(rows);
            } catch (err) {
                console.error("데이터 조회 실패:", err);
                res.status(500).send("서버 오류");
            }
        });

        app.listen(port, () => {
            console.log(`🚀 서버 실행 중: http://localhost:${port}`);
        });
    } catch (err) {
        console.error("❌ MySQL 연결 실패:", err);
    }
}

startServer();
