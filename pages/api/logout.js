import { serialize } from "cookie";

export default async function handler(req, res) {
    if (req.method !== "GET")
        return res.status(405).json({ message: "Method not allowed" });

    try {
        // ✅ 쿠키 삭제 (만료 날짜를 과거로 설정)
        const cookie = serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(0),
            path: "/",
        });

        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ message: "로그아웃 완료" });
    } catch (err) {
        console.error("로그아웃 오류:", err);
        return res.status(500).json({ message: "로그아웃 중 오류 발생" });
    }
}