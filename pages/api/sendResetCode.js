import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method Not Allowed" });

    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ 세션 대신 임시 코드 저장 (테스트용)
    global.resetCodes = global.resetCodes || {};
    global.resetCodes[email] = code;

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.naver.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"셀퍼럴닷컴" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "비밀번호 재설정 인증코드",
            text: `인증코드는 ${code} 입니다.`,
        });

        return res.status(200).json({ message: "이메일로 인증코드를 보냈습니다." });
    } catch (error) {
        console.error("메일 발송 오류:", error);
        return res.status(500).json({ message: "메일 발송 실패" });
    }
}
