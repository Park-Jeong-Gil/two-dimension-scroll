// TwoDimensionScroll React Hook
// 공식 React 지원을 위한 커스텀 훅

import { useEffect, useRef, useCallback, useState } from "react";

// TwoDimensionScroll 클래스를 동적으로 import
let TwoDimensionScrollClass = null;

// 클래스 로드 함수
function getTwoDimensionScrollClass() {
  if (TwoDimensionScrollClass) return TwoDimensionScrollClass;

  // 브라우저 환경에서만 실행
  if (typeof window === "undefined") return null;

  // 1. 전역에서 찾기 (script 태그로 로드된 경우)
  if (window.TwoDimensionScroll) {
    TwoDimensionScrollClass = window.TwoDimensionScroll;
    return TwoDimensionScrollClass;
  }

  // 2. npm 모듈에서 import 시도 (Vite/번들러 호환)
  try {
    // Vite/Webpack 환경에서는 동적 require가 지원되지 않으므로
    // ScrollClass 직접 전달을 강력히 권장
    if (typeof require !== "undefined" && typeof window !== "undefined") {
      // 브라우저에서 require가 있는 경우에만 시도 (예: Node.js 환경)
      const packageModule = require("two-dimension-scroll");
      TwoDimensionScrollClass =
        packageModule.default || // ES Module style export
        packageModule.TwoDimensionScroll || // Named export
        packageModule; // Direct export
      if (
        TwoDimensionScrollClass &&
        typeof TwoDimensionScrollClass === "function"
      ) {
        return TwoDimensionScrollClass;
      }
    } else {
      // Vite/Webpack 환경: 자동 감지 불가능
      throw new Error("Dynamic require not supported in bundler environment");
    }
  } catch (error) {
    console.debug(
      "자동 감지 실패 (Vite/번들러 환경에서는 정상):",
      error.message
    );
  }

  return null;
}

/**
 * TwoDimensionScroll을 React에서 쉽게 사용하기 위한 공식 훅
 * @param {Object} options - TwoDimensionScroll 옵션
 * @param {Object} config - 추가 설정 (deps, ScrollClass 등)
 * @returns {Object} 스크롤 인스턴스와 유틸리티 함수들
 */
export function useTwoDimensionScroll(options = {}, config = {}) {
  // config가 배열이면 기존 방식 (하위 호환성)
  const isLegacyAPI = Array.isArray(config);
  const deps = isLegacyAPI ? config : config.deps || [];
  const ScrollClass = isLegacyAPI ? null : config.ScrollClass;
  const scrollRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 스크롤 인스턴스 초기화 (데모와 동일한 타이밍)
  useEffect(() => {
    // SSR 환경에서는 실행하지 않음
    if (typeof window === "undefined") return;

    // 데모와 동일한 초기화 지연 (DOM 안정화 대기)
    const initTimer = setTimeout(() => {
      // TwoDimensionScroll 클래스 로드 (사용자 제공 > 동적 로드)
      const TwoDimensionScroll = ScrollClass || getTwoDimensionScrollClass();
      if (!TwoDimensionScroll) {
        console.warn(
          "🚨 TwoDimensionScroll 자동 감지 실패",
          "\n🎯 Vite/Webpack 환경에서는 ScrollClass 직접 전달이 필요합니다:",
          "\n\n✅ 해결 방법:",
          "\n   import TwoDimensionScroll from 'two-dimension-scroll';",
          "\n   import { useTwoDimensionScroll } from 'two-dimension-scroll/react';",
          "\n",
          "\n   const { scrollTo } = useTwoDimensionScroll(",
          "\n     { duration: 1000 },",
          "\n     { ScrollClass: TwoDimensionScroll } // 👈 이 부분을 추가하세요!",
          "\n   );",
          "\n\n💡 이렇게 하면 모든 번들러 환경에서 안정적으로 작동합니다."
        );
        return;
      }

      try {
        // 기본 옵션과 사용자 옵션 병합 (데모와 동일한 고성능 기본값)
        const defaultOptions = {
          debug: true, // ⚡ 성능 비교를 위해 디버그 활성화
          // 🖥️ 데스크톱 환경 (index.html과 완전 동일)
          desktop: {
            duration: 1000,
            horizontalSensitivity: 1.2,
            verticalSensitivity: 1.5,
            lerp: 0.1,
            wheelMultiplier: 1.1,
            precisionMode: true,
            keyboardScrollAmount: 0.8,
          },
          // 📱 모바일 환경 (index.html과 완전 동일)
          mobile: {
            duration: 800,
            horizontalSensitivity: 1.8,
            verticalSensitivity: 2.2,
            lerp: 0.15,
            touchMultiplier: 2.5,
            bounceEffect: true,
            flingMultiplier: 1.2,
            touchStopThreshold: 4,
          },
          // 📟 태블릿 환경 (index.html과 완전 동일)
          tablet: {
            duration: 900,
            horizontalSensitivity: 1.5,
            verticalSensitivity: 1.8,
            lerp: 0.12,
            wheelMultiplier: 1.05,
            touchMultiplier: 2.2,
            hybridMode: true,
          },
        };

        // 🔧 깊은 병합으로 모든 옵션 완벽 적용
        const mergedOptions = {
          ...defaultOptions,
          ...options,
          desktop: {
            ...defaultOptions.desktop,
            ...(options.desktop || {}),
          },
          mobile: {
            ...defaultOptions.mobile,
            ...(options.mobile || {}),
          },
          tablet: {
            ...defaultOptions.tablet,
            ...(options.tablet || {}),
          },
          accessibility: {
            ...(defaultOptions.accessibility || {}),
            ...(options.accessibility || {}),
          },
          ui: {
            ...(defaultOptions.ui || {}),
            ...(options.ui || {}),
          },
        };

        console.log("🎯 React Hook 최종 옵션 (데모와 비교용):", mergedOptions);

        // 인스턴스 생성
        scrollRef.current = new TwoDimensionScroll(mergedOptions);

        // 스크롤 이벤트 리스너 등록 (성능 최적화된 버전)
        const handleScroll = (data) => {
          const newPosition = data.scroll || data.scrollTop || 0;
          setScrollPosition(newPosition);

          if (mergedOptions.debug) {
            console.log("📊 React Hook 스크롤 이벤트:", {
              type: data.type,
              deltaY: Math.round(data.deltaY || 0),
              scrollTop: Math.round(newPosition),
              direction: data.direction === 1 ? "아래" : "위",
            });
          }
        };

        if (scrollRef.current.on) {
          scrollRef.current.on(handleScroll);
        }

        setIsReady(true);

        if (mergedOptions.debug) {
          console.log("✅ useTwoDimensionScroll 초기화 완료", {
            instance: scrollRef.current,
            options: mergedOptions,
          });
        }
      } catch (error) {
        console.error("TwoDimensionScroll 초기화 실패:", error);
      }
    }, 100); // 데모와 동일한 100ms 지연

    // Cleanup 함수
    return () => {
      clearTimeout(initTimer);
      if (scrollRef.current) {
        try {
          if (scrollRef.current.cleanup) {
            scrollRef.current.cleanup()();
          } else if (scrollRef.current.destroy) {
            scrollRef.current.destroy();
          }
          scrollRef.current = null;
        } catch (error) {
          console.warn("TwoDimensionScroll 정리 중 오류:", error);
        }
      }
      setIsReady(false);
    };
  }, deps); // 의존성 배열 사용

  // 유틸리티 함수들
  const scrollTo = useCallback((position, duration) => {
    if (scrollRef.current && scrollRef.current.scrollTo) {
      scrollRef.current.scrollTo(position, duration);
    }
  }, []);

  const pauseForModal = useCallback(() => {
    if (scrollRef.current && scrollRef.current.pauseForModal) {
      scrollRef.current.pauseForModal();
    }
  }, []);

  const resumeFromModal = useCallback(() => {
    if (scrollRef.current && scrollRef.current.resumeFromModal) {
      scrollRef.current.resumeFromModal();
    }
  }, []);

  const disable = useCallback(() => {
    if (scrollRef.current && scrollRef.current.updateOptions) {
      scrollRef.current.updateOptions({ disabled: true });
    }
  }, []);

  const enable = useCallback(() => {
    if (scrollRef.current && scrollRef.current.updateOptions) {
      scrollRef.current.updateOptions({ disabled: false });
    }
  }, []);

  const updateOptions = useCallback((newOptions) => {
    if (scrollRef.current && scrollRef.current.updateOptions) {
      scrollRef.current.updateOptions(newOptions);
    }
  }, []);

  const getScrollInfo = useCallback(() => {
    if (!scrollRef.current) return null;

    const maxPosition = scrollRef.current.getMaxPosition
      ? scrollRef.current.getMaxPosition()
      : 0;

    return {
      position: scrollPosition,
      maxPosition: maxPosition,
      progress: maxPosition > 0 ? scrollPosition / maxPosition : 0,
      isScrolling: scrollRef.current.isScrolling || false,
    };
  }, [scrollPosition]);

  return {
    // 인스턴스 정보
    instance: scrollRef.current,
    isReady,

    // 스크롤 정보
    scrollPosition,
    scrollInfo: getScrollInfo(),

    // 제어 함수들
    scrollTo,
    pauseForModal,
    resumeFromModal,
    disable,
    enable,
    updateOptions,

    // React 전용 유틸리티
    getReactInfo: () =>
      scrollRef.current?.getReactCompatibilityInfo?.() || null,
  };
}

/**
 * 간단한 스크롤 to top 훅
 */
export function useScrollToTop() {
  const { scrollTo } = useTwoDimensionScroll();

  return useCallback(
    (duration = 1000) => {
      scrollTo(0, duration);
    },
    [scrollTo]
  );
}

/**
 * 스크롤 진행률 추적 훅
 * @param {Function} callback - 진행률 변경 시 호출될 콜백
 * @param {number} throttle - 스로틀링 시간 (ms)
 */
export function useScrollProgress(callback, throttle = 100) {
  const { scrollPosition, scrollInfo } = useTwoDimensionScroll();
  const lastCallTime = useRef(0);

  useEffect(() => {
    if (!scrollInfo || typeof callback !== "function") return;

    const now = Date.now();
    if (now - lastCallTime.current >= throttle) {
      callback({
        position: scrollInfo.position,
        progress: scrollInfo.progress,
        percentage: Math.round(scrollInfo.progress * 100),
      });
      lastCallTime.current = now;
    }
  }, [scrollPosition, callback, throttle]);
}

/**
 * 모달 제어를 위한 훅
 * @returns {Object} 모달 열기/닫기 함수들
 */
export function useModalScroll() {
  const { pauseForModal, resumeFromModal } = useTwoDimensionScroll();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    pauseForModal();
  }, [pauseForModal]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resumeFromModal();
  }, [resumeFromModal]);

  const toggleModal = useCallback(() => {
    if (isModalOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isModalOpen, openModal, closeModal]);

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

// TypeScript용 타입 정의 (JSDoc으로 작성)
/**
 * @typedef {Object} ScrollInfo
 * @property {number} position - 현재 스크롤 위치
 * @property {number} maxPosition - 최대 스크롤 위치
 * @property {number} progress - 스크롤 진행률 (0-1)
 * @property {boolean} isScrolling - 스크롤 중인지 여부
 */

/**
 * @typedef {Object} TwoDimensionScrollHookReturn
 * @property {Object} instance - TwoDimensionScroll 인스턴스
 * @property {boolean} isReady - 초기화 완료 여부
 * @property {number} scrollPosition - 현재 스크롤 위치
 * @property {ScrollInfo} scrollInfo - 스크롤 정보 객체
 * @property {Function} scrollTo - 특정 위치로 스크롤
 * @property {Function} pauseForModal - 모달용 스크롤 정지
 * @property {Function} resumeFromModal - 모달 스크롤 재개
 * @property {Function} disable - 스크롤 비활성화
 * @property {Function} enable - 스크롤 활성화
 * @property {Function} updateOptions - 옵션 업데이트
 * @property {Function} getReactInfo - React 환경 정보 조회
 */
