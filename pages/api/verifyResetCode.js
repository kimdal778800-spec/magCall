export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method Not Allowed" });

    const { email, code } = req.body;

    if (global.resetCodes?.[email] === code) {
        return res.status(200).json({ message: "인증 성공" });
    } else {
        return res.status(400).json({ message: "인증코드가 올바르지 않습니다." });
    }
}
