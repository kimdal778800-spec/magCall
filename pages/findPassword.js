import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import AlertModal from "@/components/AlertModal";

export default function FindPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [modal, setModal] = useState({ show: false, title: "", message: "" });

    const openModal = (title, message) =>
        setModal({ show: true, title, message });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    const sendCode = async () => {
        const res = await fetch("/api/sendResetCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        openModal("이메일 발송", data.message,"success");
        if (res.ok) setStep(2);
    };

    const verifyCode = async () => {
        const res = await fetch("/api/verifyResetCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });
        const data = await res.json();
        openModal("인증 결과", data.message,"info");
        if (res.ok) setStep(3);
    };

    const resetPassword = async () => {
        if (!passwordRegex.test(newPassword)) {
            openModal("비밀번호 오류", "비밀번호는 8자리 이상이며 특수문자를 1개 이상 포함해야 합니다.","error");
            return;
        }
        if (newPassword !== confirmPassword) {
            openModal("비밀번호 불일치", "비밀번호가 일치하지 않습니다.","error");
            return;
        }

        const res = await fetch("/api/resetPassword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword }),
        });
        const data = await res.json();

        if (res.ok) {
            openModal("변경 완료", "비밀번호가 성공적으로 변경되었습니다!","success");
            setTimeout(() => (window.location.href = "/login"), 1500);
        } else {
            openModal("오류", data.message || "비밀번호 변경 실패","error");
        }
    };

    const checkLength = newPassword.length >= 8;
    const checkSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    const passwordsMatch =
        newPassword && confirmPassword && newPassword === confirmPassword;

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">비밀번호 재설정</h1>

                    {/* STEP 1: 이메일 입력 */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                이메일
                            </label>
                            <div className="flex items-center border-b border-gray-300 pb-1">
                                <input
                                    type="email"
                                    placeholder="가입한 이메일 주소"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={sendCode}
                                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                                >
                                    인증코드 발송
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: 인증코드 입력 */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500">입력한 이메일로 발송된 인증코드를 입력하세요.</p>
                            <div className="flex items-center border-b border-gray-300 pb-1">
                                <input
                                    type="text"
                                    placeholder="인증코드 입력"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-gray-800"
                                />
                                <button
                                    type="button"
                                    onClick={verifyCode}
                                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                                >
                                    인증 확인
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: 비밀번호 변경 */}
                    {step === 3 && (
                        <div className="space-y-6">
                            {/* 새 비밀번호 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    새 비밀번호
                                </label>
                                <div className="flex items-center border-b border-gray-300 focus-within:border-orange-400">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="새 비밀번호 입력"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-gray-800 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="p-2 text-gray-500 hover:text-orange-500 transition"
                                    >
                                        {showNewPassword ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1 text-xs">
                                    <p className={`${checkLength ? "text-green-600" : "text-red-500"}`}>• 8자리 이상</p>
                                    <p className={`${checkSpecial ? "text-green-600" : "text-red-500"}`}>• 특수문자 1개 이상 포함</p>
                                </div>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    비밀번호 확인
                                </label>
                                <div className="flex items-center border-b border-gray-300 focus-within:border-orange-400">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="비밀번호를 다시 입력하세요"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-gray-800 py-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="p-2 text-gray-500 hover:text-orange-500 transition"
                                    >
                                        {showConfirm ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p
                                        className={`text-xs mt-2 ${
                                            passwordsMatch ? "text-green-600" : "text-red-500"
                                        }`}
                                    >
                                        {passwordsMatch
                                            ? "✅ 비밀번호가 일치합니다."
                                            : "❌ 비밀번호가 일치하지 않습니다."}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={resetPassword}
                                className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition"
                            >
                                비밀번호 변경 완료
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <AlertModal
                show={modal.show}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
            />
        </div>
    );
}
