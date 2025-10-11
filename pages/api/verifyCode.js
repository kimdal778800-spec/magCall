// pages/api/verifyCode.js
let codeStorage = {}; // 간단한 메모리 저장용 (실제 서비스라면 Redis 등 사용)

export default function handler(req, res) {
    if (req.method === "POST") {
        const { email, code } = req.body;

        // 코드 존재 여부 확인
        if (!codeStorage[email]) {
            return res.status(400).json({ message: "인증 요청이 없습니다." });
        }

        // 코드 일치 여부 검사
        if (codeStorage[email] === code) {
            delete codeStorage[email]; // 사용 후 제거
            return res.status(200).json({ message: "인증 성공!" });
        } else {
            return res.status(400).json({ message: "인증 코드가 일치하지 않습니다." });
        }
    }

    if (req.method === "PUT") {
        // sendCode.js 에서 이메일 발송 시 여기로 코드 저장
        const { email, code } = req.body;
        codeStorage[email] = code;
        return res.status(200).json({ message: "코드 저장 완료" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
}
