// React에서 TwoDimensionScroll 사용 예제
import React, { useEffect, useRef, useState, useCallback } from "react";

// TwoDimensionScroll을 React Hook으로 사용하기 위한 커스텀 훅
const useTwoDimensionScroll = (options = {}) => {
  const scrollInstance = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scrollInfo, setScrollInfo] = useState({
    position: 0,
    progress: 0,
    direction: 0,
  });

  // 스크롤 인스턴스 초기화
  useEffect(() => {
    // SSR 안전성
    if (typeof window === "undefined") return;

    // TwoDimensionScroll 글로벌 클래스 확인
    if (!window.TwoDimensionScroll) {
      console.error("TwoDimensionScroll 라이브러리가 로드되지 않았습니다.");
      return;
    }

    try {
      // 기본 React 친화적 옵션
      const reactFriendlyOptions = {
        debug: true,
        // 환경별 최적화
        desktop: {
          duration: 1000,
          lerp: 0.1,
          precisionMode: true,
          ...options.desktop,
        },
        mobile: {
          duration: 800,
          lerp: 0.15,
          bounceEffect: true,
          ...options.mobile,
        },
        tablet: {
          duration: 900,
          lerp: 0.12,
          hybridMode: true,
          ...options.tablet,
        },
        // 접근성 최적화
        accessibility: {
          respectReducedMotion: true,
          announceScrollPosition: true,
          keyboardNavigation: true,
          ...options.accessibility,
        },
        // 스크롤바 설정
        ui: {
          hideScrollbar: true,
          ...options.ui,
        },
        ...options,
      };

      scrollInstance.current = new window.TwoDimensionScroll(
        reactFriendlyOptions
      );

      // 스크롤 이벤트 리스너 추가
      const handleScroll = (data) => {
        setScrollInfo({
          position: data.scroll || 0,
          progress: data.progress || 0,
          direction: data.direction || 0,
        });
      };

      scrollInstance.current.on(handleScroll);
      setIsInitialized(true);

      console.log(
        "✅ React에서 TwoDimensionScroll 초기화 완료:",
        scrollInstance.current.getReactCompatibilityInfo()
      );
    } catch (error) {
      console.error("TwoDimensionScroll 초기화 실패:", error);
    }

    // cleanup 함수 - React StrictMode에서도 안전
    return () => {
      if (scrollInstance.current && !scrollInstance.current.isDestroyed) {
        console.log("🧹 React useEffect cleanup 실행");
        scrollInstance.current.destroy();
      }
      setIsInitialized(false);
    };
  }, []); // 빈 의존성 배열 - 컴포넌트 마운트시에만 실행

  // 스크롤 메서드들
  const scrollTo = useCallback(
    (position, options) => {
      if (scrollInstance.current && isInitialized) {
        scrollInstance.current.scrollTo(position, options);
      }
    },
    [isInitialized]
  );

  const scrollToTop = useCallback(() => {
    scrollTo(0, { duration: 800 });
  }, [scrollTo]);

  const scrollToBottom = useCallback(() => {
    if (scrollInstance.current && isInitialized) {
      const maxPosition = scrollInstance.current.getMaxPosition();
      scrollTo(maxPosition, { duration: 1200 });
    }
  }, [scrollTo, isInitialized]);

  // 환경별 옵션 업데이트
  const updateOptions = useCallback(
    (environment, newOptions) => {
      if (scrollInstance.current && isInitialized) {
        scrollInstance.current.updateEnvironmentOptions(
          environment,
          newOptions
        );
      }
    },
    [isInitialized]
  );

  // 성능 프리셋 적용
  const applyPreset = useCallback(
    (presetName) => {
      if (scrollInstance.current && isInitialized) {
        scrollInstance.current.applyPerformancePreset(presetName);
      }
    },
    [isInitialized]
  );

  // 모달 제어
  const pauseForModal = useCallback(() => {
    if (scrollInstance.current && isInitialized) {
      scrollInstance.current.pauseForModal();
    }
  }, [isInitialized]);

  const resumeFromModal = useCallback(() => {
    if (scrollInstance.current && isInitialized) {
      scrollInstance.current.resumeFromModal();
    }
  }, [isInitialized]);

  // 접근성 정보
  const getAccessibilityStatus = useCallback(() => {
    if (scrollInstance.current && isInitialized) {
      return scrollInstance.current.getAccessibilityStatus();
    }
    return null;
  }, [isInitialized]);

  return {
    // 상태
    isInitialized,
    scrollInfo,
    instance: scrollInstance.current,

    // 메서드
    scrollTo,
    scrollToTop,
    scrollToBottom,
    updateOptions,
    applyPreset,
    pauseForModal,
    resumeFromModal,
    getAccessibilityStatus,
  };
};

// 스크롤 위치 표시 컴포넌트
const ScrollProgress = ({ scrollInfo }) => {
  const progressPercentage = Math.round(scrollInfo.progress * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px 15px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
      <div>위치: {Math.round(scrollInfo.position)}px</div>
      <div>진행률: {progressPercentage}%</div>
      <div>
        방향:{" "}
        {scrollInfo.direction > 0
          ? "⬇️"
          : scrollInfo.direction < 0
          ? "⬆️"
          : "⏸️"}
      </div>
    </div>
  );
};

// 메인 데모 컴포넌트
const TwoDimensionScrollDemo = () => {
  const {
    isInitialized,
    scrollInfo,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    updateOptions,
    applyPreset,
    pauseForModal,
    resumeFromModal,
    getAccessibilityStatus,
  } = useTwoDimensionScroll({
    // React 컴포넌트별 커스텀 옵션
    desktop: {
      duration: 1200,
      lerp: 0.08,
    },
    mobile: {
      duration: 800,
      touchMultiplier: 2.8,
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [a11yInfo, setA11yInfo] = useState(null);

  // 모달 열기
  const openModal = useCallback(() => {
    setModalOpen(true);
    pauseForModal();
  }, [pauseForModal]);

  // 모달 닫기
  const closeModal = useCallback(() => {
    setModalOpen(false);
    resumeFromModal();
  }, [resumeFromModal]);

  // 접근성 정보 조회
  const checkA11yStatus = useCallback(() => {
    const status = getAccessibilityStatus();
    setA11yInfo(status);
    console.log("♿ 접근성 상태:", status);
  }, [getAccessibilityStatus]);

  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div>🔄 TwoDimensionScroll 초기화 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 스크롤 진행률 표시 */}
      <ScrollProgress scrollInfo={scrollInfo} />

      {/* 제어 패널 */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          zIndex: 1000,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h3 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
          🚀 React + TwoDimensionScroll
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={scrollToTop} style={buttonStyle}>
            ⬆️ 맨 위로
          </button>
          <button onClick={scrollToBottom} style={buttonStyle}>
            ⬇️ 맨 아래로
          </button>
          <button
            onClick={() => scrollTo(window.innerHeight * 2)}
            style={buttonStyle}
          >
            🎯 중간으로
          </button>
        </div>

        <hr
          style={{
            margin: "15px 0",
            border: "none",
            borderTop: "1px solid #eee",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => applyPreset("smooth")} style={buttonStyle}>
            🎯 부드러움
          </button>
          <button onClick={() => applyPreset("fast")} style={buttonStyle}>
            🚀 빠름
          </button>
          <button onClick={() => applyPreset("precise")} style={buttonStyle}>
            🎨 정밀
          </button>
        </div>

        <hr
          style={{
            margin: "15px 0",
            border: "none",
            borderTop: "1px solid #eee",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={openModal} style={buttonStyle}>
            🎭 모달 열기
          </button>
          <button onClick={checkA11yStatus} style={buttonStyle}>
            ♿ 접근성 확인
          </button>
        </div>

        {a11yInfo && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            <strong>접근성 상태:</strong>
            <br />
            모션 감소: {a11yInfo.reducedMotionActive ? "✅" : "❌"}
            <br />
            키보드 네비게이션: {a11yInfo.keyboardNavigationActive ? "✅" : "❌"}
            <br />
            스크린 리더: {a11yInfo.settings?.screenReader ? "✅" : "❌"}
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 */}
      <div style={{ padding: "100px 50px" }}>
        {/* 섹션들 */}
        {[1, 2, 3, 4, 5].map((num) => (
          <div
            key={num}
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(45deg, hsl(${
                num * 60
              }, 70%, 60%), hsl(${num * 60 + 60}, 70%, 80%))`,
              margin: "50px 0",
              borderRadius: "20px",
              color: "white",
              fontSize: "48px",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Section {num}
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                fontSize: "18px",
                opacity: 0.8,
              }}
            >
              React + TwoDimensionScroll 🚀
            </div>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "500px",
              maxHeight: "400px",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>🎭 React 모달 테스트</h2>
            <p>이 모달이 열려있는 동안 바깥 스크롤은 비활성화됩니다.</p>
            <p>모달 내부에서는 일반 스크롤이 작동합니다.</p>

            {/* 긴 콘텐츠 */}
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <p key={i}>
                  모달 내용 줄 {i + 1} - React 컴포넌트에서 완벽하게 작동하는
                  TwoDimensionScroll! 🎉
                </p>
              ))}

            <button
              onClick={closeModal}
              style={{
                ...buttonStyle,
                marginTop: "20px",
                background: "#ff4757",
              }}
            >
              모달 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 버튼 스타일
const buttonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  background: "#007bff",
  color: "white",
  cursor: "pointer",
  fontSize: "13px",
  transition: "all 0.2s ease",
};

// Next.js에서 사용하는 경우
export const NextJsExample = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR 중에는 렌더링하지 않음
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return <TwoDimensionScrollDemo />;
};

export default TwoDimensionScrollDemo;

// TypeScript 타입 정의 (참고용)
/*
interface TwoDimensionScrollOptions {
  desktop?: {
    duration?: number;
    lerp?: number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    precisionMode?: boolean;
    keyboardScrollAmount?: number;
  };
  mobile?: {
    duration?: number;
    lerp?: number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    touchMultiplier?: number;
    bounceEffect?: boolean;
    flingMultiplier?: number;
    touchStopThreshold?: number;
  };
  tablet?: {
    duration?: number;
    lerp?: number;
    hybridMode?: boolean;
  };
  accessibility?: {
    respectReducedMotion?: boolean;
    announceScrollPosition?: boolean;
    keyboardNavigation?: boolean;
    focusManagement?: boolean;
  };
  ui?: {
    hideScrollbar?: boolean;
    customScrollbarStyle?: boolean;
  };
  debug?: boolean;
}

interface ScrollInfo {
  position: number;
  progress: number;
  direction: number;
}

interface UseTwoDimensionScrollReturn {
  isInitialized: boolean;
  scrollInfo: ScrollInfo;
  instance: any;
  scrollTo: (position: number, options?: any) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  updateOptions: (environment: string, options: any) => void;
  applyPreset: (presetName: string) => void;
  pauseForModal: () => void;
  resumeFromModal: () => void;
  getAccessibilityStatus: () => any;
}
*/
