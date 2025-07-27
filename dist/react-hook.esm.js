// TwoDimensionScroll React Hook
// 공식 React 지원을 위한 커스텀 훅

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * TwoDimensionScroll을 React에서 쉽게 사용하기 위한 공식 훅
 * @param {Object} options - TwoDimensionScroll 옵션
 * @param {Object} deps - 의존성 배열 (옵션 변경 시 재초기화)
 * @returns {Object} 스크롤 인스턴스와 유틸리티 함수들
 */
export function useTwoDimensionScroll(options = {}, deps = []) {
  const scrollRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // 스크롤 인스턴스 초기화
  useEffect(() => {
    // SSR 환경에서는 실행하지 않음
    if (typeof window === "undefined") return;

    // TwoDimensionScroll 로드 확인
    if (!window.TwoDimensionScroll) {
      console.warn(
        "TwoDimensionScroll이 로드되지 않았습니다. 스크립트를 먼저 로드해주세요."
      );
      return;
    }

    try {
      // 기본 옵션과 사용자 옵션 병합
      const defaultOptions = {
        debug: process.env.NODE_ENV === "development",
        desktop: {
          duration: 1000,
          lerp: 0.1,
          sensitivity: 1.0,
        },
        mobile: {
          duration: 800,
          lerp: 0.15,
          sensitivity: 1.2,
        },
      };

      const mergedOptions = {
        ...defaultOptions,
        ...options,
        desktop: { ...defaultOptions.desktop, ...options.desktop },
        mobile: { ...defaultOptions.mobile, ...options.mobile },
      };

      // 인스턴스 생성
      scrollRef.current = new window.TwoDimensionScroll(mergedOptions);

      // 스크롤 이벤트 리스너 등록
      const handleScroll = (data) => {
        setScrollPosition(data.scroll || data.scrollTop || 0);
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

    // Cleanup 함수
    return () => {
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

    return {
      position: scrollPosition,
      maxPosition: scrollRef.current.limit || 0,
      progress: scrollRef.current.limit
        ? scrollPosition / scrollRef.current.limit
        : 0,
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
