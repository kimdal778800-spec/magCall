import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineCheckCircle, AiOutlineWarning, AiOutlineCloseCircle } from "react-icons/ai";

export default function AlertModal({ show, title, message, onClose, type = "info" }) {
    // ✅ 상태별 색상 및 아이콘 설정
    const typeStyles = {
        success: {
            icon: <AiOutlineCheckCircle className="text-green-500" size={48} />,
            accent: "text-green-600",
            button: "bg-green-500 hover:bg-green-600",
        },
        warning: {
            icon: <AiOutlineWarning className="text-yellow-500" size={48} />,
            accent: "text-yellow-600",
            button: "bg-yellow-500 hover:bg-yellow-600",
        },
        error: {
            icon: <AiOutlineCloseCircle className="text-red-500" size={48} />,
            accent: "text-red-600",
            button: "bg-red-500 hover:bg-red-600",
        },
        info: {
            icon: <AiOutlineCheckCircle className="text-orange-500" size={48} />,
            accent: "text-orange-600",
            button: "bg-orange-500 hover:bg-orange-600",
        },
    };

    const style = typeStyles[type] || typeStyles.info;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-8 text-center"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        {/* ✅ 아이콘 */}
                        <div className="flex justify-center mb-4">{style.icon}</div>

                        {/* 제목 + 메시지 */}
                        <h2 className={`text-lg font-semibold mb-2 ${style.accent}`}>{title}</h2>
                        <p className="text-gray-600 mb-6">{message}</p>

                        {/* 확인 버튼 */}
                        <button
                            onClick={onClose}
                            className={`${style.button} text-white px-6 py-2 rounded-lg transition shadow-sm`}
                        >
                            확인
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
