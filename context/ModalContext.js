import { createContext, useContext, useState, useCallback } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
    const [modal, setModal] = useState(null); // { message, type, resolve }

    const showModal = useCallback((message, type = "info") => {
        return new Promise((resolve) => {
            setModal({ message, type, resolve });
        });
    }, []);

    const handleClose = () => {
        if (modal?.resolve) modal.resolve();
        setModal(null);
    };

    const iconMap = {
        info:    { icon: "ℹ️", bg: "bg-blue-100",  border: "border-blue-300",  btn: "bg-blue-500 hover:bg-blue-600" },
        success: { icon: "✅", bg: "bg-green-100", border: "border-green-300", btn: "bg-green-500 hover:bg-green-600" },
        error:   { icon: "❌", bg: "bg-red-100",   border: "border-red-300",   btn: "bg-red-500 hover:bg-red-600" },
        warning: { icon: "⚠️", bg: "bg-yellow-100",border: "border-yellow-300",btn: "bg-yellow-500 hover:bg-yellow-600" },
    };
    const style = iconMap[modal?.type] || iconMap.info;

    return (
        <ModalContext.Provider value={{ showModal }}>
            {children}
            {modal && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    onClick={handleClose}
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
                        <button
                            onClick={handleClose}
                            className={`mt-5 w-full py-2.5 rounded-full text-white font-bold text-sm transition ${style.btn}`}
                        >
                            확인
                        </button>
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
