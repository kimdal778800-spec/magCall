import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if (err) {
        console.error("DB 연결 실패:", err);
    } else {
        console.log("DB 연결 성공");
    }
});

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { entries } = req.body;

        // 각 항목을 DB에 저장하는 쿼리
        const insertQuery =
            "INSERT INTO applications (exchange, uid, user_id) VALUES (?, ?, ?)";

        // 사용자 ID (로그인된 사용자의 ID를 받아오는 방식에 맞게 수정)
        const userId = 1; // 예시로 1로 설정, 실제로는 로그인된 사용자의 ID로 대체

        // 여러 항목을 DB에 저장
        for (let entry of entries) {
            const { exchange, uid } = entry;
            connection.query(insertQuery, [exchange, uid, userId], (err, results) => {
                if (err) {
                    console.error("DB 저장 실패:", err);
                    return res.status(500).json({ message: "DB 저장 실패" });
                }
            });
        }

        res.status(200).json({ message: "신청이 완료되었습니다." });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
