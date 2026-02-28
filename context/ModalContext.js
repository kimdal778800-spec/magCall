import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modal, setModal] = useState(null); // { message, type, resolve }

    const showModal = useCallback((message, type = "info") => {
        return new Promise((resolve) => {
            setModal({ message, type, resolve });
        });
    }, []);

    const handleClose = (result = undefined) => {
        if (modal?.resolve) modal.resolve(result);
        setModal(null);
    };

    const iconMap = {
        info:    { icon: "ℹ️", bg: "bg-blue-100",  border: "border-blue-300",  btn: "bg-blue-500 hover:bg-blue-600" },
        success: { icon: "✅", bg: "bg-green-100", border: "border-green-300", btn: "bg-green-500 hover:bg-green-600" },
        error:   { icon: "❌", bg: "bg-red-100",   border: "border-red-300",   btn: "bg-red-500 hover:bg-red-600" },
        warning: { icon: "⚠️", bg: "bg-yellow-100",border: "border-yellow-300",btn: "bg-yellow-500 hover:bg-yellow-600" },
        confirm: { icon: "❓", bg: "bg-gray-100",  border: "border-gray-300",  btn: "bg-red-500 hover:bg-red-600" },
    };
    const style = iconMap[modal?.type] || iconMap.info;
    const isConfirm = modal?.type === "confirm";

    return (
        <ModalContext.Provider value={{ showModal }}>
            {children}
            {modal && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    onClick={() => handleClose(false)}
                >
                    <div
                        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border-2 ${style.border} animate-modalPop`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center text-2xl mx-auto mb-4`}>
                            {style.icon}
                        </div>
                        <p className="text-gray-800 text-center text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                            {modal.message}
                        </p>
                        {isConfirm ? (
                            <div className="mt-5 flex gap-3">
                                <button
                                    onClick={() => handleClose(false)}
                                    className="flex-1 py-2.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm transition"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 py-2.5 rounded-full text-white font-bold text-sm transition ${style.btn}`}
                                >
                                    확인
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleClose()}
                                className={`mt-5 w-full py-2.5 rounded-full text-white font-bold text-sm transition ${style.btn}`}
                            >
                                확인
                            </button>
                        )}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used within ModalProvider");
    return ctx;
}
