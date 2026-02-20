import { useState } from "react";
import { useRouter } from "next/router";
import AlertModal from "@/components/AlertModal";

const ApplyPage = () => {
    const [entries, setEntries] = useState([{ exchange: "", uid: "" }]); // 항목 초기 상태
    const router = useRouter();
    const [modal, setModal] = useState({ show: false, title: "", message: "" });
    const openModal = (title, message, type = "info") =>
        setModal({ show: true, title, message, type });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    const handleAddEntry = () => {
        setEntries([...entries, { exchange: "", uid: "" }]); // 새 항목 추가
    };

    const handleRemoveEntry = (index) => {
        if (entries.length === 1) {
            openModal("최소 1개의 항목이 필요합니다.", );
            return;
        }
        const updatedEntries = entries.filter((_, i) => i !== index); // 항목 삭제
        setEntries(updatedEntries);
    };

    const handleChange = (index, field, value) => {
        const updatedEntries = [...entries];
        updatedEntries[index][field] = value; // 입력 값 업데이트
        setEntries(updatedEntries);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 신청한 내용들을 API로 전송
        const response = await fetch("/api/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ entries }),
        });

        if (response.ok) {
            router.push("/confirmation"); // 신청 완료 후 확인 페이지로 이동
        } else {
            openModal("신청에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">신청 페이지</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 여러 항목을 입력할 수 있도록 반복 */}
                        {entries.map((entry, index) => (
                            <div key={index} className="flex items-center gap-4">
                                {/* 거래소 선택 */}
                                <div className="flex-1">
                                    <label
                                        htmlFor={`exchange-${index}`}
                                        className="block text-sm font-medium text-red-400 mb-2"
                                    >
                                        거래소 선택
                                    </label>
                                    <div className="flex items-center border-b border-gray-300 pb-1 w-full sm:w-[150px]">
                                        <select
                                            id={`exchange-${index}`}
                                            value={entry.exchange}
                                            onChange={(e) => handleChange(index, "exchange", e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                            required
                                        >
                                            <option value="">선택하세요</option>
                                            <option value="echobit">에코빗</option>
                                            <option value="bingx">BINGX</option>
                                            <option value="ascendex">어센드엑스</option>
                                            <option value="bitmex">비트맥스</option>
                                            <option value="bitget">비트겟</option>
                                        </select>
                                    </div>
                                </div>

                                {/* UID 입력 */}
                                <div className="flex-1">
                                    <label
                                        htmlFor={`uid-${index}`}
                                        className="block text-sm font-medium text-gray-600 mb-2"
                                    >
                                        UID
                                    </label>
                                    <div className="flex items-center border-b border-gray-300 pb-1 w-full sm:w-[350px]">
                                        <input
                                            type="text"
                                            id={`uid-${index}`}
                                            value={entry.uid}
                                            onChange={(e) => handleChange(index, "uid", e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-gray-800"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 항목 삭제 버튼 */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEntry(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    삭제
                                </button>
                            </div>
                        ))}

                        {/* + 버튼 (항목 추가) */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleAddEntry}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                + 항목 추가
                            </button>
                        </div>

                        {/* 신청 버튼 */}
                        <div className="text-right">
                            <button
                                type="submit"
                                className="w-full border border-orange-400 text-orange-500 font-semibold py-2 rounded-md hover:bg-orange-50 transition duration-200"
                            >
                                신청
                            </button>
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
};

export default ApplyPage;
