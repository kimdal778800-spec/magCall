// components/CryptoTicker.js
export default function CryptoTicker({ prices, flash, getFlashClass, getChangeColor, USD_RATE }) {
    return (
        <div className="bg-blue-50 border border-blue-100 rounded-lg py-5 px-6 shadow-sm w-full md:w-auto text-center">
            <h3 className="text-gray-800 font-semibold mb-3 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradientMove">
                💹 실시간 암호화폐 시세 (Upbit KRW / USD)
            </h3>

            {/* 암호화폐 시세 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-bold">
                {Object.entries(prices).map(([sym, { price, changeRate }]) => (
                    <div
                        key={sym}
                        className={`flex flex-col items-center rounded-md p-2 transition ${getFlashClass(sym)}`}
                    >
            <span
                className={`${
                    sym === "BTC"
                        ? "text-yellow-600"
                        : sym === "ETH"
                            ? "text-blue-600"
                            : sym === "XRP"
                                ? "text-green-600"
                                : "text-purple-600"
                }`}
            >
              {sym}
            </span>

                        <span className="flex flex-col items-center">
              <span className="text-gray-800 text-base font-bold">
                {price ? price.toLocaleString() : "Loading..."}
              </span>
              <span className="text-xs text-gray-500 mt-[1px]">
                {price
                    ? `$${(price / USD_RATE).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                    })}`
                    : ""}
              </span>
            </span>

                        <span className={`text-sm mt-1 ${getChangeColor(changeRate)}`}>
              {changeRate !== null ? `${(changeRate * 100).toFixed(2)}%` : ""}
            </span>
                    </div>
                ))}
            </div>

            {/* 환율 정보 */}
            <div className="mt-5 text-center text-sm text-gray-600">
                💱 <span className="font-semibold text-blue-600">1 USD</span> ≈{" "}
                <span className="font-bold text-gray-800">
          {USD_RATE
              ? USD_RATE.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
              : "Loading..."}
        </span>{" "}
                KRW
                <p className="text-xs text-gray-500 mt-1">
                    * 환율 정보: 네이버 금융 (3분마다 갱신)
                </p>
            </div>
        </div>
    );
}
