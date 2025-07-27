export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions", "not dead"],
        },
        modules: false, // Rollup이 모듈을 처리하도록
      },
    ],
  ],
  plugins: [
    // 🚨 프로덕션 환경에서만 콘솔 로그 제거
    ...(process.env.NODE_ENV === "production"
      ? [
          [
            "transform-remove-console",
            {
              exclude: ["error", "warn"], // error와 warn은 유지 (선택사항)
            },
          ],
        ]
      : []),
  ],
};
