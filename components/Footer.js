export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-xs text-gray-500">
            <p className="mb-1">
                copyright © 2024 <span className="font-medium text-gray-600">셀퍼럴.kr</span>, All Rights Reserved
            </p>
            <p className="mb-1 leading-relaxed">
                상호명 : <span className="font-medium">주식회사 마운틴그룹 (Mountain Group)</span> |
                {/*사업자번호 : 296-81-03378 | 주소 : 서울특별시 강남구 언주로 331 |*/}
                이메일 : <a href="mailto:Mountain@naver.com" className="text-gray-600 hover:text-orange-500">Mountain@naver.com</a>
            </p>
            <div className="space-x-4 mt-1">
                <a href="#" className="text-gray-600 hover:text-orange-500">셀퍼럴.kr 약관</a>
                <a href="#" className="text-gray-600 hover:text-orange-500">개인정보처리방침</a>
            </div>
        </footer>
    );
}
