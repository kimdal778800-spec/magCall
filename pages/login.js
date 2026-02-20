import { useState } from "react";
import { useRouter } from "next/router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth  } from "@/context/AuthContext";
import AlertModal from "@/components/AlertModal";


export default function Login() {
    const router = useRouter();
    const { login } = useAuth(); // ✅ Context 접근
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState({ show: false, title: "", message: "" });
    const openModal = (title, message, type = "info") =>
        setModal({ show: true, title, message, type });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            login({ email: data.user.email, name: data.user.name ,level: data.user.level });
            openModal("로그인 성공", `${data.user.name}님 환영합니다!`,"success");
            // if (data.user.level >= 9) {
            //     router.push("/admin/App");
            // }else {
                setTimeout(() => router.push("/"), 1000);
            // }
        } else {
            openModal("로그인 실패", "이메일 또는 비밀번호를 확인해주세요.","error");
        }
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">로그인</h1>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {/* 이메일 */}
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
                                    placeholder="이메일을 입력하세요"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 bg-transparent outline-none text-gray-800"
                                />
                            </div>
                        </div>

                        {/* 비밀번호 + 👁️ 보기/숨기기 */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-600 mb-2"
                            >
                                비밀번호
                            </label>
                            <div className="flex items-center border-b border-gray-300 focus-within:border-orange-400">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호를 입력하세요"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="flex-1 bg-transparent outline-none text-gray-800 py-2"
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
                        </div>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            className="w-full border border-orange-400 text-orange-500 font-semibold
                                 py-2 rounded-md hover:bg-orange-50 transition duration-200"
                        >
                            로그인
                        </button>

                        {/* 회원가입 / 비밀번호 재설정 */}
                        <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
                            <p>
                                아직 계정이 없으신가요?{" "}
                                <a href="/signup" className="text-orange-500 hover:underline">
                                    회원가입
                                </a>
                            </p>
                            <p>
                                비밀번호를 잊으셨나요?{" "}
                                <a href="/findPassword" className="text-orange-500 hover:underline">
                                    비밀번호 재설정
                                </a>
                            </p>
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
