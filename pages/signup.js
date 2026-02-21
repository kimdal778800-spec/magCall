import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AlertModal from "@/components/AlertModal";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `${a} + ${b}`, answer: a + b };
}

export default function Signup() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        nickname: "",
        password: "",
        confirmPassword: "",
        email: "",
        captcha: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [captcha, setCaptcha] = useState({ question: "", answer: 0 });
    const [modal, setModal] = useState({ show: false, title: "", message: "", type: "info" });

    const openModal = (title, message, type = "info") =>
        setModal({ show: true, title, message, type });
    const closeModal = () => setModal({ show: false, title: "", message: "", type: "info" });

    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 아이디 유효성: 영문자, 숫자, _ 만 허용, 최소 3자
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    const usernameValid = usernameRegex.test(form.username);
    const passwordValid = passwordRegex.test(form.password);
    const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!usernameValid) {
            openModal("아이디 오류", "아이디는 영문자, 숫자, _만 사용 가능하며 최소 3자 이상이어야 합니다.", "error");
            return;
        }
        if (!form.nickname.trim()) {
            openModal("닉네임 오류", "닉네임을 입력해주세요.", "error");
            return;
        }
        if (!passwordValid) {
            openModal("비밀번호 오류", "비밀번호는 8자리 이상이며 특수문자를 1개 이상 포함해야 합니다.", "error");
            return;
        }
        if (form.password !== form.confirmPassword) {
            openModal("비밀번호 불일치", "비밀번호가 일치하지 않습니다.", "error");
            return;
        }
        if (parseInt(form.captcha) !== captcha.answer) {
            openModal("보안문자 오류", "보안문자가 올바르지 않습니다.", "error");
            setCaptcha(generateCaptcha());
            setForm((prev) => ({ ...prev, captcha: "" }));
            return;
        }

        try {
            const res = await fetch("/api/registerUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    nickname: form.nickname,
                    password: form.password,
                    email: form.email || null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                openModal("가입 완료", "회원가입이 완료되었습니다!", "success");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                openModal("회원가입 실패", data.message || "서버 오류가 발생했습니다.", "error");
            }
        } catch (err) {
            console.error(err);
            openModal("서버 오류", "회원가입 중 문제가 발생했습니다.", "error");
        }
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">회원가입</h1>

                    <form className="space-y-7" onSubmit={handleSubmit}>
                        {/* 아이디 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                아이디
                            </label>
                            <input
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="영문자, 숫자, _ 만 입력 가능"
                                required
                                className="w-full border-b border-gray-300 focus:border-orange-400 outline-none py-2 text-gray-800 bg-transparent"
                            />
                            {form.username && (
                                <p className={`text-xs mt-1 ${usernameValid ? "text-green-600" : "text-red-500"}`}>
                                    {usernameValid
                                        ? "✅ 사용 가능한 아이디입니다."
                                        : "❌ 영문자, 숫자, _만 사용 가능하며 최소 3자 이상 입력하세요."}
                                </p>
                            )}
                            {!form.username && (
                                <p className="text-xs mt-1 text-gray-400">
                                    영문자, 숫자, _ 만 입력 가능. 최소 3자 이상 입력하세요.
                                </p>
                            )}
                        </div>

                        {/* 닉네임 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                닉네임
                            </label>
                            <input
                                name="nickname"
                                type="text"
                                value={form.nickname}
                                onChange={handleChange}
                                placeholder="닉네임을 입력하세요"
                                required
                                className="w-full border-b border-gray-300 focus:border-orange-400 outline-none py-2 text-gray-800 bg-transparent"
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                비밀번호
                            </label>
                            <div className="flex items-center border-b border-gray-300 focus-within:border-orange-400">
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
                                    className="p-2 text-gray-400 hover:text-orange-500 transition"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-1 space-y-0.5 text-xs">
                                    <p className={form.password.length >= 8 ? "text-green-600" : "text-red-500"}>
                                        • 8자리 이상
                                    </p>
                                    <p className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password) ? "text-green-600" : "text-red-500"}>
                                        • 특수문자 1개 이상 포함
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                비밀번호 확인
                            </label>
                            <div className="flex items-center border-b border-gray-300 focus-within:border-orange-400">
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
                                    className="p-2 text-gray-400 hover:text-orange-500 transition"
                                >
                                    {showConfirm ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                            {form.confirmPassword && (
                                <p className={`text-xs mt-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                                    {passwordsMatch ? "✅ 비밀번호가 일치합니다." : "❌ 비밀번호가 일치하지 않습니다."}
                                </p>
                            )}
                        </div>

                        {/* 이메일 (선택) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                이메일 <span className="text-gray-400 font-normal">(선택)</span>
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="이메일을 입력하세요 (선택사항)"
                                className="w-full border-b border-gray-300 focus:border-orange-400 outline-none py-2 text-gray-800 bg-transparent"
                            />
                        </div>

                        {/* 보안문자 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                보안문자 입력
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded px-5 py-2 font-bold text-gray-700 text-lg select-none tracking-widest min-w-[100px]">
                                    {captcha.question} = ?
                                </div>
                                <input
                                    name="captcha"
                                    type="number"
                                    value={form.captcha}
                                    onChange={handleChange}
                                    placeholder="답 입력"
                                    required
                                    className="w-28 border-b border-gray-300 focus:border-orange-400 outline-none py-2 text-gray-800 bg-transparent text-center"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCaptcha(generateCaptcha());
                                        setForm((prev) => ({ ...prev, captcha: "" }));
                                    }}
                                    className="text-xs text-gray-400 hover:text-orange-500 transition underline"
                                >
                                    새로고침
                                </button>
                            </div>
                        </div>

                        {/* 가입 버튼 */}
                        <button
                            type="submit"
                            className="w-full border border-orange-300 text-orange-500 py-3 rounded hover:bg-orange-50 transition font-medium mt-4"
                        >
                            회원가입
                        </button>

                        {/* 로그인 안내 */}
                        <div className="text-center text-sm text-gray-500">
                            이미 계정이 있으신가요?{" "}
                            <a href="/login" className="text-orange-500 hover:underline">
                                로그인
                            </a>
                        </div>
                    </form>
                </div>
            </main>

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
