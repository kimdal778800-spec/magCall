import { useRouter } from 'next/router';

const ConfirmationPage = () => {
    const router = useRouter();

    // 홈으로 돌아가기 클릭 이벤트
    const handleGoHome = () => {
        router.push('/'); // 홈 페이지로 이동
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">신청 완료</h1>
            <p className="text-gray-700 mb-6">
                신청이 성공적으로 완료되었습니다! 거래소에서 처리가 완료되면
                알림을 드리겠습니다.
            </p>
            <button
                onClick={handleGoHome} // 클릭 이벤트 핸들러 추가
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
                홈으로 돌아가기
            </button>
        </div>
    );
};

export default ConfirmationPage;
