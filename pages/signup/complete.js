import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AlertModal from "@/components/AlertModal";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // 👁️ 아이콘 추가

export default function SignupComplete() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
        name: "",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [modal, setModal] = useState({ show: false, title: "", message: "" });
    const openModal = (title, message, type = "info") =>
        setModal({ show: true, title, message, type });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    // ✅ 비밀번호 정규식 (특수문자 1개 이상 + 8자리 이상)
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    useEffect(() => {
        if (router.query.email) setEmail(router.query.email);
    }, [router.query.email]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordRegex.test(form.password)) {
            openModal("비밀번호 오류", "비밀번호는 8자리 이상이며 특수문자를 1개 이상 포함해야 합니다.","error");
            return;
        }

        if (form.password !== form.confirmPassword) {
            openModal("비밀번호 불일치", "비밀번호가 일치하지 않습니다.","error");
            return;
        }

        try {
            const res = await fetch("/api/registerUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, email }),
            });

            const data = await res.json();

            if (res.ok) {
                openModal("가입 완료", "회원가입이 성공적으로 완료되었습니다!","success");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                openModal("회원가입 실패", data.message || "서버 오류가 발생했습니다.","error");

            }
        } catch (err) {
            console.error(err);
            openModal("서버 오류", "회원가입 중 문제가 발생했습니다.","error");
        }
    };

    const checkLength = form.password.length >= 8;
    const checkSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password);
    const passwordsMatch =
        form.password && form.confirmPassword && form.password === form.confirmPassword;

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-50 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">회원가입</h1>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* 인증된 이메일 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                인증된 이메일
                            </label>
                            <div className="font-semibold text-gray-900 border-b border-gray-200 py-2 select-none">
                                {email || "인증된 이메일이 없습니다."}
                            </div>
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                비밀번호
                            </label>
                            <div className="flex items-center border-b border-gray-200 focus-within:border-orange-400">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                    required
                                    className="flex-1 py-2 outline-none text-gray-800 bg-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-2 text-gray-500 hover:text-orange-500 transition"
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 space-y-1 text-xs">
                                <p className={`${checkLength ? "text-green-600" : "text-red-500"}`}>
                                    • 8자리 이상
                                </p>
                                <p className={`${checkSpecial ? "text-green-600" : "text-red-500"}`}>
                                    • 특수문자 1개 이상 포함
                                </p>
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                비밀번호 확인
                            </label>
                            <div className="flex items-center border-b border-gray-200 focus-within:border-orange-400">
                                <input
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    required
                                    className="flex-1 py-2 outline-none text-gray-800 bg-transparent"
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
                            {form.confirmPassword && (
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

                        {/* 이름 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                이름
                            </label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="이름을 입력하세요"
                                required
                                className="w-full border-b border-gray-200 focus:border-orange-400 outline-none py-2 text-gray-800"
                            />
                        </div>

                        {/* 휴대폰 번호 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                휴대폰 번호
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="하이픈(-) 없이 숫자만 입력"
                                pattern="[0-9]{10,11}"
                                required
                                className="w-full border-b border-gray-200 focus:border-orange-400 outline-none py-2 text-gray-800"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                하이픈(-) 없이 숫자만 입력해주세요.
                            </p>
                        </div>

                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            className="w-full border border-orange-300 text-orange-500 py-3 rounded hover:bg-orange-50 transition font-medium"
                        >
                            회원가입
                        </button>

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

            {/* ✅ 공통 Alert Modal */}
            <AlertModal
                show={modal.show}
                title={modal.title}
                message={modal.message}
                onClose={closeModal}
                type={modal.type}
            />
        </div>
    );
}
