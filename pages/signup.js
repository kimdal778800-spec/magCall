import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AlertModal from "@/components/AlertModal";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(0);
    const router = useRouter();

    const [modal, setModal] = useState({ show: false, title: "", message: "" });
    const openModal = (title, message) =>
        setModal({ show: true, title, message });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    // ✅ 타이머 동작
    useEffect(() => {
        if (timer <= 0) return;
        const countdown = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(countdown);
    }, [timer]);

    // ✅ 타이머 종료 후 자동 재활성화
    useEffect(() => {
        if (timer === 0 && isCodeSent && !isVerified) {
            setIsCodeSent(false);
            setMessage("⏰ 인증 시간이 만료되었습니다. 다시 시도해주세요.");
        }
    }, [timer, isCodeSent, isVerified]);

    // ✅ 인증코드 전송
    const handleSendCode = async () => {
        if (!email) {
            openModal("확인 요청", "이메일을 입력하세요.");
            return;
        }

        // 1️⃣ 이메일 중복 확인
        const checkRes = await fetch("/api/checkEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();

        if (checkData.exists) {
            // 이미 가입된 이메일
            openModal("확인 요청", "⚠️ 이미 가입된 이메일입니다.");
            return;
        }

        setMessage("메일 전송 중...");

        const res = await fetch("/api/sendCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (res.ok) {
            setIsCodeSent(true);
            setMessage("✅ 인증코드가 이메일로 전송되었습니다. (3분 이내 입력)");
            setTimer(180); // 3분 타이머 시작
        } else {
            setMessage(data.message || "메일 전송 실패");
        }
    };

    // ✅ 인증코드 확인
    const handleVerifyCode = async () => {
        if (timer <= 0) {
            openModal("인증 실패", "인증코드가 만료되었습니다. 다시 요청해주세요.");
            return;
        }

        const res = await fetch("/api/verifyCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });

        const data = await res.json();
        if (res.ok) {
            setIsVerified(true);
            setMessage("✅ 이메일 인증이 완료되었습니다!");
            setTimeout(() => router.push(`/signup/complete?email=${email}`), 1000);
        } else {
            setMessage(data.message || "인증 실패. 코드를 다시 확인하세요.");
        }
    };

    // ✅ 남은 시간 표시
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">회원가입</h1>

                    <form
                        className="space-y-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                    >
                        {/* 이메일 입력 */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-600 mb-2"
                            >
                                이메일
                            </label>
                            <div className="flex items-center border-b border-gray-300 pb-1">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="이메일을 입력하세요"
                                    required
                                    className="flex-1 bg-transparent outline-none text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={isCodeSent}
                                    className={`w-32 py-2 rounded-md font-semibold border transition-all duration-200 ease-in-out
                    ${
                                        isCodeSent
                                            ? "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                                            : "border-orange-400 text-orange-500 hover:bg-orange-50"
                                    }`}
                                >
                                    {isCodeSent ? "전송 완료" : "인증코드 전송"}
                                </button>
                            </div>
                        </div>

                        {/* 인증코드 입력 */}
                        {isCodeSent && (
                            <div>
                                <label
                                    htmlFor="code"
                                    className="block text-sm font-medium text-gray-600 mb-2"
                                >
                                    인증코드
                                </label>
                                <div className="flex items-center border-b border-gray-300 pb-1 gap-2">
                                    <input
                                        id="code"
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="이메일로 받은 코드를 입력하세요"
                                        required
                                        className="flex-1 bg-transparent outline-none text-gray-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyCode}
                                        disabled={isVerified}
                                        className={`${
                                            isVerified
                                                ? "bg-green-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                        } text-white px-4 py-2 rounded transition`}
                                    >
                                        {isVerified ? "인증 완료" : "코드 확인"}
                                    </button>
                                </div>

                                {/* 남은 시간 표시 */}
                                {timer > 0 && !isVerified && (
                                    <p className="text-right text-sm text-orange-500 mt-1">
                                        남은 시간: {formatTime(timer)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* 상태 메시지 */}
                        {message && (
                            <p className="text-center text-sm text-gray-600 mt-2">{message}</p>
                        )}

                        {/* 로그인 안내 */}
                        <div className="text-center text-sm text-gray-500 mt-8">
                            이미 계정이 있으신가요?{" "}
                            <a href="/login" className="text-orange-500 hover:underline">
                                로그인
                            </a>
                        </div>
                    </form>
                </div>
            </main>

            {/* 공통 모달 */}
            <AlertModal
                show={modal.show}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
            />
        </div>
    );
}
