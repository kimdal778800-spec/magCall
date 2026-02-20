import { serialize } from "cookie";

export default async function handler(req, res) {
    if (req.method !== "GET")
        return res.status(405).json({ message: "Method not allowed" });

    try {
        const cookie = serialize("token", "", {
            httpOnly: true,
            secure: false,
            // secure: process.env.NODE_ENV === "production",

            sameSite: "lax",
            path: "/",
            maxAge: 0, // 즉시 만료
        });

        res.setHeader("Set-Cookie", cookie);
        return res.status(200).json({ message: "로그아웃 완료" });
    } catch (err) {
        console.error("로그아웃 오류:", err);
        return res.status(500).json({ message: "로그아웃 중 오류 발생" });
    }
}
