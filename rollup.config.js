import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

export default [
  // 메인 라이브러리 빌드
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: !isProduction,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: !isProduction,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // tsc로 따로 생성
        declarationMap: false,
      }),
      // 🚨 Babel로 콘솔 로그 제거 (프로덕션에서만)
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        extensions: [".js", ".ts"],
      }),
      // 프로덕션에서 코드 압축
      isProduction &&
        terser({
          compress: {
            drop_console: true, // 추가 보장
            drop_debugger: true,
          },
        }),
    ].filter(Boolean),
  },

  // React Hook 빌드
  {
    input: "src/react-hook.js",
    output: [
      {
        file: "dist/react-hook.js",
        format: "cjs",
        sourcemap: !isProduction,
      },
      {
        file: "dist/react-hook.esm.js",
        format: "es",
        sourcemap: !isProduction,
      },
    ],
    external: ["react"], // React를 external로 처리
    plugins: [
      resolve(),
      commonjs(),
      // 🚨 Babel로 콘솔 로그 제거 (프로덕션에서만)
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        extensions: [".js"],
      }),
      // 프로덕션에서 코드 압축
      isProduction &&
        terser({
          compress: {
            drop_console: true, // 추가 보장
            drop_debugger: true,
          },
        }),
    ].filter(Boolean),
  },
];
