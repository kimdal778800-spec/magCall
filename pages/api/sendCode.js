import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.naver.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"셀퍼럴닷컴" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "📩 셀퍼럴 이메일 인증코드입니다.",
            html: `<h2>인증코드: <strong style="color:#ff6b6b">${verificationCode}</strong></h2>`,
        });

        // ✅ 인증코드 서버에 저장
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/verifyCode`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
        });

        return res.status(200).json({ message: "이메일 전송 성공" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "메일 발송 실패", error: err.message });
    }
}
