// npm install two-dimension-scroll 테스트

// 1. Vanilla JavaScript import 테스트
try {
  console.log("🧪 Vanilla JS import 테스트...");

  // ES Module import
  const TwoDimensionScroll = require("./dist/index.js").TwoDimensionScroll;
  console.log("✅ CommonJS import 성공:", typeof TwoDimensionScroll);

  // 인스턴스 생성 테스트
  const scrollInstance = new TwoDimensionScroll({
    duration: 1000,
    debug: true,
  });
  console.log("✅ 인스턴스 생성 성공:", scrollInstance.constructor.name);
} catch (error) {
  console.error("❌ Vanilla JS import 실패:", error.message);
}

// 2. React Hook import 테스트
try {
  console.log("\n🧪 React Hook import 테스트...");

  // React Hook 파일 존재 확인
  const fs = require("fs");
  const reactHookExists = fs.existsSync("./dist/react-hook.js");
  const reactTypesExists = fs.existsSync("./dist/react-hook.d.ts");

  console.log("✅ React Hook JS 파일 존재:", reactHookExists);
  console.log("✅ React Hook 타입 파일 존재:", reactTypesExists);

  if (reactHookExists) {
    // React Hook 파일 로드 테스트 (실제 React 없이)
    const reactHookContent = fs.readFileSync("./dist/react-hook.js", "utf8");
    console.log("✅ React Hook 파일 읽기 성공");
    console.log(
      "✅ Export 함수들:",
      reactHookContent.includes("useTwoDimensionScroll")
        ? "useTwoDimensionScroll"
        : "없음",
      reactHookContent.includes("useModalScroll") ? "useModalScroll" : "없음",
      reactHookContent.includes("useScrollToTop") ? "useScrollToTop" : "없음"
    );
  }
} catch (error) {
  console.error("❌ React Hook 테스트 실패:", error.message);
}

// 3. Package.json exports 확인
try {
  console.log("\n🧪 Package.json exports 확인...");

  const packageJson = require("./package.json");
  console.log("✅ Main:", packageJson.main);
  console.log("✅ Module:", packageJson.module);
  console.log("✅ Types:", packageJson.types);
  console.log("✅ Exports:", JSON.stringify(packageJson.exports, null, 2));
} catch (error) {
  console.error("❌ Package.json 확인 실패:", error.message);
}

console.log("\n🎉 테스트 완료!");
console.log("📦 설치 명령어: npm install two-dimension-scroll");
console.log("📝 사용법:");
console.log("   // Vanilla JS");
console.log('   import TwoDimensionScroll from "two-dimension-scroll";');
console.log("   // React Hook");
console.log(
  '   import { useTwoDimensionScroll } from "two-dimension-scroll/react";'
);
