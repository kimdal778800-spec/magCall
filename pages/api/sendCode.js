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
            html:`
                  <div style="font-family: Pretendard, Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color:#333;">📮 셀퍼럴 인증코드</h2>
                    <p>아래 코드를 인증창에 입력해 주세요.</p>
                    <div style="padding:12px 20px; background:#f8f9fa; border-radius:8px; display:inline-block; font-size:18px; letter-spacing:4px; font-weight:700; border:1px solid #ddd;">
                      ${verificationCode}
                    </div>
                    <p style="margin-top:20px; font-size:13px; color:#666;">본 메일은 발신 전용입니다.</p>
                  </div>
                `,
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
