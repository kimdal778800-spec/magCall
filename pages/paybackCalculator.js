import { useState } from "react";
import { useRouter } from "next/router";
import AlertModal from "@/components/AlertModal";

const PaybackCalculator = () => {
    const [exchange, setExchange] = useState("");
    const [leverage, setLeverage] = useState("");
    const [seed, setSeed] = useState("");
    const [trades, setTrades] = useState("");
    const [modal, setModal] = useState({ show: false, title: "", message: "" });
    const openModal = (title, message) =>
        setModal({ show: true, title, message });
    const closeModal = () => setModal({ show: false, title: "", message: "" });

    const handleSubmit = (e) => {
        e.preventDefault();

        // 계산된 값 처리 로직 추가
        const calculatedPayback = (parseInt(leverage) * parseFloat(seed) * parseInt(trades)) / 1000;
        openModal(`계산된 페이백: ${calculatedPayback}`);
    };

    return (
        <div className="min-h-[calc(100dvh-56px)] bg-gray-100 flex flex-col items-center justify-between -mt-1">
            <main className="flex-1 w-full flex justify-center">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                    <h1 className="text-2xl font-bold text-center mb-12">페이백 계산기</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* 거래소 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-orange-400 mb-2">거래소 선택</label>
                            <select
                                value={exchange}
                                onChange={(e) => setExchange(e.target.value)}
                                className="w-full p-2 border-b border-gray-300 bg-transparent outline-none text-gray-800"
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

                        <div>
                            <label className="block text-sm font-medium text-orange-400 mb-2">평균 레버리지 배율을 알려주세요</label>
                            <input
                                type="number"
                                value={leverage}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (value > 125) {
                                        value = 125; // 125 이상일 경우 자동으로 125로 제한
                                        openModal("배율은 125를 초과할 수 없습니다."); // 사용자에게 알림
                                    }
                                    setLeverage(value); // 제한된 값 설정
                                }}
                                className="w-full p-2 border-b border-gray-300 bg-transparent outline-none text-gray-800"
                                min="1"
                                max="125"
                                required
                            />
                        </div>


                        {/* 시드 금액 */}
                        <div>
                            <label className="block text-sm font-medium text-orange-400 mb-2">시드를 입력해주세요</label>
                            <input
                                type="number"
                                value={seed}
                                onChange={(e) => setSeed(e.target.value)}
                                className="w-full p-2 border-b border-gray-300 bg-transparent outline-none text-gray-800"
                                required
                            />
                        </div>

                        {/* 거래 성향 */}
                        <div>
                            <label className="block text-sm font-medium text-orange-400 mb-2">하루에 몇 번 정도 거래를 하시나요?</label>
                            <select
                                value={trades}
                                onChange={(e) => setTrades(e.target.value)}
                                className="w-full p-2 border-b border-gray-300 bg-transparent outline-none text-gray-800"
                                required
                            >
                                <option value="">선택하세요</option>
                                <option value="1">하루에 1회 정도 거래해요</option>
                                <option value="2-3">하루에 1회~2회 정도 거래해요</option>
                                <option value="3-5">하루에 3회~5회 정도 거래해요</option>
                                <option value="6-10">하루에 6회~10회 정도 거래해요</option>
                                <option value="11">하루에 11회 정도 거래해요</option>
                            </select>
                        </div>

                        {/* 계산 버튼 */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="w-full py-2 border border-orange-400 text-orange-500 font-semibold rounded-md hover:bg-orange-50 transition duration-200"
                            >
                                계산하기
                            </button>
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

};

export default PaybackCalculator;
