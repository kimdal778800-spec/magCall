/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
    compress: true, // gzip 압축 활성화
    swcMinify: true, // 빠른 Rust 기반 빌드 사용
    typescript: { ignoreBuildErrors: true }, // 메모리 절약
    eslint: { ignoreDuringBuilds: true }, // 빌드시 ESLint 생략
    async rewrites() {
        return [
            { source: "/images/:path*", destination: "/api/images/:path*" },
        ];
    },
    async redirects() {
        return [
            // ✅ 예전 퓨니코드 도메인/이전 도메인으로 들어온 요청을 msgcall.kr로 301 리다이렉트
            //    (동일 서버에 두 도메인이 함께 연결되어 있으면 Google이 두 도메인을 중복 콘텐츠로 인식하는 문제 방지)
            {
                source: "/:path*",
                has: [{ type: "host", value: "xn--24-vf0jt1u98lggi.com" }],
                destination: "https://msgcall.kr/:path*",
                permanent: true,
            },
            {
                source: "/:path*",
                has: [{ type: "host", value: "www.msgcall.kr" }],
                destination: "https://msgcall.kr/:path*",
                permanent: true,
            },
        ];
    },
    async headers() {
        return [
            {
                source: "/favicon.ico",
                headers: [
                    { key: "Content-Type", value: "image/x-icon" },
                    { key: "Cache-Control", value: "no-store, must-revalidate" },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
