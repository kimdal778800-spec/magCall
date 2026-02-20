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
    experimental: {
        turbo: {
            loaders: {
                '.js': ['@swc/jsx', '@swc/jsx-runtime'], // 빠른 빌드용
            },
        },
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
