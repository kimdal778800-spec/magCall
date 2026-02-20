import { useRouter } from "next/router";

const PaybackResult = () => {
    const router = useRouter();
    const { exchange, leverage, seed, trades } = router.query;

    // 예상 페이백 계산 로직 (간단히 계산식 예시)
    const calculatePayback = () => {
        const baseAmount = 1000; // 임의의 기본 금액
        const leverageFactor = parseFloat(leverage) || 1;
        const tradesFactor = parseInt(trades) || 1;
        const seedAmount = parseFloat(seed) || 1000;

        return (baseAmount * leverageFactor * tradesFactor * seedAmount) / 1000;
    };

    const paybackAmount = calculatePayback();

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-sm py-16 px-12 mt-8 mb-12">
                <h1 className="text-2xl font-bold text-center mb-8">예상 페이백 계산 결과</h1>
                <div className="space-y-6">
                    <p className="text-lg">거래소: {exchange}</p>
                    <p className="text-lg">평균 레버리지 배율: {leverage}</p>
                    <p className="text-lg">시드 금액: {seed}</p>
                    <p className="text-lg">하루 거래 횟수: {trades}</p>
                    <p className="text-xl font-semibold">
                        예상 페이백 금액: {paybackAmount.toLocaleString()}원
                    </p>
                </div>
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/")}
                        className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaybackResult;
