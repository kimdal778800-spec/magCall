import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { username, nickname, password, email } = req.body;

    if (!username || !nickname || !password)
        return res.status(400).json({ message: "필수 항목이 누락되었습니다." });

    // 아이디 유효성 검사
    if (!/^[a-zA-Z0-9_]{3,}$/.test(username))
        return res.status(400).json({ message: "아이디는 영문자, 숫자, _만 사용 가능하며 최소 3자 이상이어야 합니다." });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // 아이디 중복 확인
        const [existsUsername] = await connection.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );
        if (existsUsername.length > 0) {
            await connection.end();
            return res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
        }

        // 이메일 중복 확인 (이메일이 입력된 경우만)
        if (email) {
            const [existsEmail] = await connection.execute(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );
            if (existsEmail.length > 0) {
                await connection.end();
                return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
            }
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 유저 저장
        await connection.execute(
            "INSERT INTO users (username, nickname, name, password, email, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
            [username, nickname, nickname, hashedPassword, email || null]
        );

        await connection.end();

        return res.status(200).json({ message: "회원가입 성공" });
    } catch (err) {
        console.error("회원가입 오류:", err);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
