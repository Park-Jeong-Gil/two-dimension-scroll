import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 🚀 데모와 완전히 동일한 성능의 React Hook
 * bundle-simple.js에서 완벽하게 작동하는 코드를 React Hook으로 변환
 */

// 🚨 bundle-simple.js의 완전한 코드를 React Hook으로 임베드
function createTwoDimensionScrollClass() {
  // === 이징 함수들 ===
  const Easing = {
    linear: function (t) {
      return t;
    },
    easeInQuad: function (t) {
      return t * t;
    },
    easeOutQuad: function (t) {
      return t * (2 - t);
    },
    easeInOutQuad: function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    easeInCubic: function (t) {
      return t * t * t;
    },
    easeOutCubic: function (t) {
      return --t * t * t + 1;
    },
    easeInOutCubic: function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    easeOutExpo: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    easeOutCirc: function (t) {
      return Math.sqrt(1 - --t * t);
    },
  };

  // === 유틸리티 함수들 ===
  function isMobile() {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  function isTouchDevice() {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  function detectEnvironment() {
    if (typeof window === "undefined") return "desktop";

    var isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    var isTouchCapable =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    var isSmallScreen = window.innerWidth <= 768;
    var isTablet =
      /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) &&
      window.innerWidth >= 768;

    if (isMobileUA && !isTablet) return "mobile";
    if (isSmallScreen && isTouchCapable) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getMaxScrollTop() {
    if (typeof document === "undefined") return 0;
    return Math.max(
      document.body.scrollHeight - window.innerHeight,
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );
  }

  function getCurrentScrollTop() {
    if (typeof window === "undefined") return 0;
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  var raf = (function () {
    if (typeof window === "undefined")
      return function (callback) {
        return setTimeout(callback, 16);
      };
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback) {
        return setTimeout(callback, 16);
      }
    );
  })();

  var cancelRaf = (function () {
    if (typeof window === "undefined") return clearTimeout;
    return (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      clearTimeout
    );
  })();

  function supportsPassive() {
    if (typeof window === "undefined") return false;
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
          return true;
        },
      });
      window.addEventListener("testPassive", function () {}, opts);
      window.removeEventListener("testPassive", function () {}, opts);
    } catch (e) {}
    return supportsPassive;
  }

  function lerp(start, end, factor) {
    return (1 - factor) * start + factor * end;
  }

  // 🚨 데모와 완전히 동일한 메인 클래스
  function TwoDimensionScroll(options) {
    options = options || {};

    // 현재 환경 감지
    this.currentEnvironment = detectEnvironment();
    this.isMobileDevice = this.currentEnvironment === "mobile";
    this.isTabletDevice = this.currentEnvironment === "tablet";
    this.isDesktopDevice = this.currentEnvironment === "desktop";

    // 환경별 기본 옵션
    var defaultOptions = {
      disabled: false,
      debug: false,

      // UI/UX 옵션 - 데모와 완전히 동일
      ui: {
        hideScrollbar: true, // 스크롤바 숨김 (기본값: true)
        showScrollProgress: false, // 스크롤 진행률 표시 (기본값: false)
        customScrollbarStyle: false, // 커스텀 스크롤바 스타일 (기본값: false)
      },

      desktop: {
        duration: 1000,
        horizontalSensitivity: 1.2,
        verticalSensitivity: 1.5,
        lerp: 0.1,
        wheelMultiplier: 1.1,
        precisionMode: true,
        keyboardScrollAmount: 0.8,
        prioritizeVertical: false, // 🆕 Y축 우선 모드 (기본값: false)
        lockTouchDirection: true, // 🆕 터치 방향 고정 (기본값: true)
        touchDirectionThreshold: 15, // 🆕 방향 결정 임계값 (기본값: 15px)
        allowDirectionChange: true, // 🆕 방향 전환 허용 (기본값: true)
        directionChangeThreshold: 25, // 🆕 방향 전환 임계값 (기본값: 25px)
        directionChangeSmoothness: 0.3, // 🆕 방향 전환 스무딩 (기본값: 0.3)
        useAngleBasedDirection: true, // 🆕 각도 기반 방향 결정 (기본값: true)
        horizontalAngleThreshold: 20, // 🆕 가로 스크롤 인식 각도 (기본값: 20도)
      },
      mobile: {
        duration: 800,
        horizontalSensitivity: 1.8,
        verticalSensitivity: 2.2,
        lerp: 0.15,
        touchMultiplier: 2.5,
        bounceEffect: true,
        flingMultiplier: 1.2,
        touchStopThreshold: 4,
        prioritizeVertical: false, // 🆕 Y축 우선 모드 (기본값: false)
        lockTouchDirection: true, // 🆕 터치 방향 고정 (기본값: true)
        touchDirectionThreshold: 20, // 🆕 방향 결정 임계값 (모바일: 20px)
        allowDirectionChange: true, // 🆕 방향 전환 허용 (기본값: true)
        directionChangeThreshold: 30, // 🆕 방향 전환 임계값 (모바일: 30px)
        directionChangeSmoothness: 0.4, // 🆕 방향 전환 스무딩 (모바일: 0.4)
        useAngleBasedDirection: true, // 🆕 각도 기반 방향 결정 (기본값: true)
        horizontalAngleThreshold: 5, // 🆕 가로 스크롤 인식 각도 (모바일: 5도, 극도로 엄격)
      },
      tablet: {
        duration: 900,
        horizontalSensitivity: 1.5,
        verticalSensitivity: 1.8,
        lerp: 0.12,
        wheelMultiplier: 1.05,
        touchMultiplier: 2.2,
        hybridMode: true,
        prioritizeVertical: false, // 🆕 Y축 우선 모드 (기본값: false)
        lockTouchDirection: true, // 🆕 터치 방향 고정 (기본값: true)
        touchDirectionThreshold: 18, // 🆕 방향 결정 임계값 (태블릿: 18px)
        allowDirectionChange: true, // 🆕 방향 전환 허용 (기본값: true)
        directionChangeThreshold: 28, // 🆕 방향 전환 임계값 (태블릿: 28px)
        directionChangeSmoothness: 0.35, // 🆕 방향 전환 스무딩 (태블릿: 0.35)
        useAngleBasedDirection: true, // 🆕 각도 기반 방향 결정 (기본값: true)
        horizontalAngleThreshold: 18, // 🆕 가로 스크롤 인식 각도 (태블릿: 18도)
      },
    };

    // 환경별 옵션 병합
    this.options = this.mergeOptions(options, defaultOptions);

    // lenis 스타일 상태 변수들
    this.targetScroll = 0;
    this.animatedScroll = 0;
    this.isScrolling = false;
    this.isAnimating = false;
    this.rafId = null;
    this.scrollCallbacks = [];
    this.passive = false;

    // 터치 관련 변수들
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchStartTime = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastTouchTime = 0;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;
    this.touchStopTimer = null;
    this.isModalOpen = false;

    // 🆕 터치 방향 고정을 위한 속성들
    this.touchDirection = null;
    this.touchDirectionLocked = false;
    this.touchStartDeltaX = 0;
    this.touchStartDeltaY = 0;

    // 🆕 방향 전환 감지를 위한 속성들
    this.oppositeDirectionCount = 0;
    this.lastDeltaX = 0;
    this.lastDeltaY = 0;
    this.smoothedDeltaX = 0;
    this.smoothedDeltaY = 0;
    this.directionChangeStartTime = 0;
    this.verticalScrollDirection = null; // 🆕 세로 스크롤 방향 추적

    // 🚨 모달 관련 속성 추가

    // 초기화
    this.passive = supportsPassive() ? { passive: false } : false;
    this.targetScroll = getCurrentScrollTop();
    this.animatedScroll = this.targetScroll;

    // 🚨 environment 속성 설정
    this.environment = this.currentEnvironment;

    this.init();
  }

  // 환경별 옵션 병합
  TwoDimensionScroll.prototype.mergeOptions = function (userOptions, defaults) {
    var merged = {};

    // 공통 옵션 병합
    for (var key in defaults) {
      if (key !== "desktop" && key !== "mobile" && key !== "tablet") {
        if (key === "ui") {
          // 🚨 UI 옵션은 깊게 병합
          merged[key] = {};
          var defaultUI = defaults[key] || {};
          var userUI = userOptions[key] || {};

          // 기본 UI 옵션을 먼저 복사
          for (var uiKey in defaultUI) {
            merged[key][uiKey] = defaultUI[uiKey];
          }

          // 사용자 UI 옵션으로 덮어쓰기
          for (var uiKey in userUI) {
            merged[key][uiKey] = userUI[uiKey];
          }
        } else {
          merged[key] =
            userOptions[key] !== undefined ? userOptions[key] : defaults[key];
        }
      }
    }

    // 환경별 옵션 병합
    var envDefaults = defaults[this.currentEnvironment] || defaults.desktop;
    var userEnvOptions = userOptions[this.currentEnvironment] || {};

    // 기존 방식 호환성: 최상위 레벨 옵션이 있으면 현재 환경에 적용
    for (var envKey in envDefaults) {
      if (userOptions[envKey] !== undefined) {
        merged[envKey] = userOptions[envKey];
      } else if (userEnvOptions[envKey] !== undefined) {
        merged[envKey] = userEnvOptions[envKey];
      } else {
        merged[envKey] = envDefaults[envKey];
      }
    }

    return merged;
  };

  // 초기화
  TwoDimensionScroll.prototype.init = function () {
    if (typeof window === "undefined") return;

    this.disableDefaultScroll();
    this.setupScrollbarStyles(); // 🚨 스크롤바 스타일 설정 추가
    this.bindEvents();
    this.startAnimationLoop();
  };

  // 스크롤바 스타일 설정 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.setupScrollbarStyles = function () {
    // 🚨 기존 스크롤바 스타일 태그 제거
    var existingScrollbarStyle = document.getElementById(
      "twodimension-scrollbar-styles"
    );
    if (existingScrollbarStyle && existingScrollbarStyle.parentNode) {
      existingScrollbarStyle.parentNode.removeChild(existingScrollbarStyle);
    }

    var style = document.createElement("style");
    style.id = "twodimension-scrollbar-styles";

    // 기본 CSS
    var baseCSS = `
      html {
        scroll-behavior: auto !important;
        -webkit-overflow-scrolling: touch;
      }
    `;

    // 스크롤바 숨김 CSS (옵션에 따라)
    var scrollbarCSS = "";
    if (this.options.ui?.hideScrollbar !== false) {
      scrollbarCSS = `
        /* 스크롤바 숨김 */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none !important;
        }
        html {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `;
    } else {
      // 🚨 스크롤바 표시 - 아무 스타일도 적용하지 않음 (브라우저 기본값 사용)
      if (this.options.ui?.customScrollbarStyle) {
        // 커스텀 스크롤바 스타일만 적용
        scrollbarCSS = `
          /* 커스텀 스크롤바 */
          html {
            -ms-overflow-style: auto !important;
            scrollbar-width: thin !important;
          }
          html::-webkit-scrollbar {
            width: 8px !important;
          }
          html::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1) !important;
          }
          html::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.3) !important;
            border-radius: 4px !important;
          }
          html::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.5) !important;
          }
        `;
      }
      // else: scrollbarCSS는 빈 문자열로 유지 - 브라우저 기본 스크롤바 사용
    }

    style.textContent = baseCSS + scrollbarCSS;
    document.head.appendChild(style);
    this.scrollbarStyleElement = style;

    if (this.options.debug) {
      var cssStatus;
      if (this.options.ui?.hideScrollbar !== false) {
        cssStatus = "스크롤바 숨김 CSS 적용";
      } else if (this.options.ui?.customScrollbarStyle) {
        cssStatus = "커스텀 스크롤바 CSS 적용";
      } else {
        cssStatus = "브라우저 기본 스크롤바 사용 (CSS 없음)";
      }
    }
  };

  // 기본 스크롤 비활성화 - 스크롤바 제어는 setupScrollbarStyles에서 처리
  TwoDimensionScroll.prototype.disableDefaultScroll = function () {
    var style = document.createElement("style");
    style.id = "twodimension-base-styles";
    style.textContent = `
      html {
        overflow-x: hidden;
        scroll-behavior: auto;
      }
      body {
        overflow-x: hidden;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
    this.styleElement = style;

    // 🚨 모달 친화적인 스크롤 차단 시스템 - 개선된 버전
    var self = this;
    this.preventScroll = function (e) {
      if (self.options.disabled) return;

      // React 합성 이벤트와의 충돌 방지
      if (
        e.isPropagationStopped &&
        typeof e.isPropagationStopped === "function" &&
        e.isPropagationStopped()
      ) {
        return;
      }

      // 수동 모달 모드일 때 간단한 처리
      if (self.isModalOpen) {
        var target = e.target;
        var element = target;

        // 모달 관련 요소인지 빠른 체크
        var isInModal = false;
        var checkElement = element;

        // 최대 10단계까지만 부모 요소 탐색 (성능 최적화)
        for (
          var i = 0;
          i < 10 && checkElement && checkElement !== document.body;
          i++
        ) {
          if (checkElement.classList) {
            var classList = checkElement.classList;
            if (
              classList.contains("modal") ||
              classList.contains("modal-overlay") ||
              classList.contains("modal-content") ||
              classList.contains("modal-wrapper") ||
              checkElement.getAttribute("role") === "dialog" ||
              checkElement.getAttribute("aria-modal") === "true"
            ) {
              isInModal = true;
              break;
            }
          }
          checkElement = checkElement.parentElement;
        }

        if (isInModal) {
          return; // 모달 내부 스크롤 허용
        } else {
          e.preventDefault(); // 모달 외부 스크롤 차단
          return;
        }
      }

      // 일반 모드에서의 모달 내부 스크롤 감지 (React 환경 최적화)
      var target = e.target;
      var element = target;

      // 부모 요소들을 순회하면서 모달 관련 요소 확인
      var modalElement = null;
      while (element && element !== document.body) {
        if (!element.tagName) {
          element = element.parentElement;
          continue;
        }

        var tagName = element.tagName.toLowerCase();
        var classList = element.classList || [];
        var role = element.getAttribute("role") || "";
        var ariaModal = element.getAttribute("aria-modal");

        // 모달 관련 요소 감지 (React 환경 포함한 포괄적 조건들)
        var isModal =
          // HTML5 dialog 요소
          tagName === "dialog" ||
          // 일반적인 모달 클래스명들
          classList.contains("modal") ||
          classList.contains("modal-overlay") ||
          classList.contains("modal-content") ||
          classList.contains("modal-wrapper") ||
          classList.contains("modal-container") ||
          classList.contains("dialog") ||
          classList.contains("popup") ||
          classList.contains("overlay") ||
          classList.contains("lightbox") ||
          classList.contains("backdrop") ||
          // React Portal 패턴
          element.id === "modal-root" ||
          element.id === "portal-root" ||
          // ARIA 속성
          role === "dialog" ||
          role === "alertdialog" ||
          role === "modal" ||
          ariaModal === "true" ||
          // React 모달 라이브러리 패턴
          classList.contains("ReactModal__Overlay") ||
          classList.contains("ReactModal__Content");

        if (isModal) {
          modalElement = element;
          break;
        }

        element = element.parentElement;
      }

      // 모달 내부에서 발생한 스크롤인 경우
      if (modalElement) {
        // 수동 모달 모드이고 모달 내부가 아닌 경우 차단
        if (self.isModalOpen) {
          return; // 수동 모달 모드에서는 모달 내부 모든 스크롤 허용
        }

        // 스크롤 가능한 요소 찾기 (모달 내부의 실제 스크롤 컨테이너)
        var scrollableElement = self.findScrollableElement(
          target,
          modalElement
        );

        if (scrollableElement) {
          var scrollTop = scrollableElement.scrollTop;
          var scrollHeight = scrollableElement.scrollHeight;
          var clientHeight = scrollableElement.clientHeight;
          var maxScrollTop = scrollHeight - clientHeight;

          if (e.type === "wheel") {
            // 휠 스크롤의 경우 오버스크롤 체크
            var deltaY = e.deltaY || e.detail || e.wheelDelta;
            var isScrollingDown = deltaY > 0;
            var isScrollingUp = deltaY < 0;

            // 스크롤 끝에서 더 스크롤하려고 할 때 body 스크롤 차단
            var shouldBlockOverscroll = false;

            if (isScrollingUp && scrollTop <= 0) {
              // 맨 위에서 위로 더 스크롤하려고 할 때
              shouldBlockOverscroll = true;
            } else if (isScrollingDown && scrollTop >= maxScrollTop) {
              // 맨 아래에서 아래로 더 스크롤하려고 할 때
              shouldBlockOverscroll = true;
            }

            if (shouldBlockOverscroll) {
              e.preventDefault();
              return;
            }
          } else if (e.type === "touchmove") {
            // 터치 스크롤의 경우 - CSS overscroll-behavior에 주로 의존
            // 모바일에서는 자연스러운 터치 스크롤을 위해 오버스크롤 차단을 최소화
            var isAtTop = scrollTop <= 0;
            var isAtBottom = scrollTop >= maxScrollTop;

            // 정확히 끝에 도달했을 때만 차단 (여유값 제거)
            if ((isAtTop || isAtBottom) && maxScrollTop > 0) {
              // 모바일에서는 더 관대하게 - preventDefault 하지 않고 CSS에 의존
              // e.preventDefault();
              // return;
            }
          }
        }

        return; // 모달 내부에서는 기본 스크롤 허용 (오버스크롤 제외)
      }

      // 모달이 아닌 경우 body 스크롤 차단

      e.preventDefault();
    };

    document.addEventListener("wheel", this.preventScroll, { passive: false });
    document.addEventListener("touchmove", this.preventScroll, {
      passive: false,
    });
  };

  // 이벤트 바인딩 - 모바일에서도 휠 + 터치 모두 지원
  TwoDimensionScroll.prototype.bindEvents = function () {
    if (typeof window === "undefined") return;

    var self = this;

    // 🚨 휠 이벤트 핸들러 함수 저장 (디버깅용)
    this.wheelHandler = function (e) {
      self.onWheel(e);
    };

    // 🔍 전역 휠 이벤트 감지기 (디버깅용)
    if (this.options.debug) {
      this.globalWheelDetector = function (e) {
        console.log("🌍 전역 휠 이벤트 감지:", {
          type: e.type,
          deltaY: e.deltaY,
          target: e.target ? e.target.tagName : "undefined",
          isTrusted: e.isTrusted,
        });
      };

      // 전역 리스너 추가 (캡처 단계)
      document.addEventListener("wheel", this.globalWheelDetector, {
        capture: true,
        passive: true,
      });
    }

    // 🚨 휠 이벤트는 모든 환경에서 항상 바인딩 (모바일 + 마우스/트랙패드 지원)
    // 디바이스 모드 호환성을 위해 passive 옵션 조정
    var wheelOptions = { passive: false, capture: false };

    document.addEventListener("wheel", this.wheelHandler, wheelOptions);

    // 🚨 디바이스 모드 호환성을 위한 추가 이벤트 바인딩
    document.addEventListener("mousewheel", this.wheelHandler, wheelOptions);
    document.addEventListener(
      "DOMMouseScroll",
      this.wheelHandler,
      wheelOptions
    );

    // 🚨 터치 이벤트도 모든 환경에서 항상 바인딩 (하이브리드 지원)
    document.addEventListener(
      "touchstart",
      function (e) {
        self.onTouchStart(e);
      },
      this.passive
    );
    document.addEventListener(
      "touchmove",
      function (e) {
        self.onTouchMove(e);
      },
      this.passive
    );
    document.addEventListener(
      "touchend",
      function (e) {
        self.onTouchEnd(e);
      },
      this.passive
    );
  };

  // 애니메이션 루프 시작
  TwoDimensionScroll.prototype.startAnimationLoop = function () {
    var self = this;

    function animate() {
      var oldAnimatedScroll = self.animatedScroll;
      self.animatedScroll = lerp(
        self.animatedScroll,
        self.targetScroll,
        self.options.lerp
      );

      var maxScrollTop = getMaxScrollTop();
      self.animatedScroll = clamp(self.animatedScroll, 0, maxScrollTop);
      self.targetScroll = clamp(self.targetScroll, 0, maxScrollTop);

      var difference = Math.abs(self.targetScroll - self.animatedScroll);
      var positionChange = Math.abs(self.animatedScroll - oldAnimatedScroll);

      if (difference < 0.5 && positionChange < 0.1) {
        self.animatedScroll = self.targetScroll;
        window.scrollTo(0, self.animatedScroll);
        self.isScrolling = false;
        self.rafId = null;
        return;
      }

      if (difference > 0.1 || positionChange > 0.05) {
        window.scrollTo(0, self.animatedScroll);

        if (difference > 0.5) {
          self.isScrolling = true;

          var eventData = {
            deltaX: 0,
            deltaY: self.targetScroll - self.animatedScroll,
            scrollTop: self.animatedScroll,
            direction: self.targetScroll > self.animatedScroll ? 1 : -1,
            type: "smooth",
          };

          for (var i = 0; i < self.scrollCallbacks.length; i++) {
            self.scrollCallbacks[i](eventData);
          }
        } else {
          self.isScrolling = false;
        }
      }

      self.rafId = raf(animate);
    }

    animate();
  };

  // 휠 이벤트 핸들러 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.onWheel = function (event) {
    if (this.options.debug) {
      console.log("🚨 휠 이벤트 호출됨!", {
        disabled: this.options.disabled,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        target: event.target.tagName,
        environment: this.environment,
      });
    }

    if (this.options.disabled) return;

    // 🎭 모달이 열려있을 때는 preventScroll을 통해 모달 내부/외부 구분 처리
    if (this.isModalOpen) {
      if (this.options.debug) {
        console.log("🎭 모달 모드: onWheel 비활성화 및 기본 스크롤 차단");
      }
      this.preventScroll(event); // preventScroll을 통해 모달 내부/외부 구분 처리
      return;
    }

    var deltaX = event.deltaX;
    var deltaY = event.deltaY;

    var normalizedDeltaX = deltaX;
    var normalizedDeltaY = deltaY;

    if (event.deltaMode === 1) {
      normalizedDeltaX *= 40;
      normalizedDeltaY *= 40;
    } else if (event.deltaMode === 2) {
      normalizedDeltaX *= window.innerHeight * 0.8;
      normalizedDeltaY *= window.innerHeight * 0.8;
    }

    // 🚨 NaN 방지를 위한 안전한 값 처리
    var horizontalSens = this.options.horizontalSensitivity || 1.0;
    var verticalSens = this.options.verticalSensitivity || 1.0;
    var wheelMult = this.options.wheelMultiplier || 1.0;

    var adjustedDeltaX = normalizedDeltaX * horizontalSens;
    var adjustedDeltaY = normalizedDeltaY * verticalSens;

    // 🚨 NaN 검증
    if (isNaN(adjustedDeltaX)) adjustedDeltaX = 0;
    if (isNaN(adjustedDeltaY)) adjustedDeltaY = 0;

    if (this.options.debug) {
      console.log("🖱️ 휠 이벤트:", {
        원시_deltaX: deltaX,
        원시_deltaY: deltaY,
        정규화_deltaX: normalizedDeltaX,
        정규화_deltaY: normalizedDeltaY,
        민감도_H: horizontalSens,
        민감도_V: verticalSens,
        조정된_deltaX: adjustedDeltaX,
        조정된_deltaY: adjustedDeltaY,
        가로스크롤_감지:
          Math.abs(adjustedDeltaX) > Math.abs(adjustedDeltaY)
            ? "✅ YES"
            : "❌ NO",
      });
    }

    var combinedDelta = this.calculateCombinedDelta(
      adjustedDeltaX,
      adjustedDeltaY
    );

    // 🚨 NaN 검증
    if (isNaN(combinedDelta)) {
      console.error("❌ combinedDelta가 NaN입니다:", {
        adjustedDeltaX: adjustedDeltaX,
        adjustedDeltaY: adjustedDeltaY,
      });
      combinedDelta = 0;
    }

    this.addToScroll(combinedDelta * wheelMult);
  };

  // 터치 시작 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.onTouchStart = function (event) {
    if (this.options.disabled) return;

    var touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();

    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
    this.lastTouchTime = this.touchStartTime;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;

    // 🆕 터치 방향 고정 초기화
    this.touchDirection = null;
    this.touchDirectionLocked = false;
    this.touchStartDeltaX = 0;
    this.touchStartDeltaY = 0;

    // 🆕 방향 전환 감지를 위한 속성들
    this.oppositeDirectionCount = 0;
    this.lastDeltaX = 0;
    this.lastDeltaY = 0;
    this.smoothedDeltaX = 0;
    this.smoothedDeltaY = 0;
    this.directionChangeStartTime = 0;
    this.verticalScrollDirection = null; // 🆕 세로 스크롤 방향 추적

    // 🚨 모달 관련 속성 추가

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }
  };

  // 터치 이동 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.onTouchMove = function (event) {
    if (this.options.debug) {
      console.log("🚨 터치 이동 이벤트 호출됨!", {
        disabled: this.options.disabled,
        touches: event.touches.length,
        target: event.target.tagName,
      });
    }

    if (this.options.disabled) return;

    var touch = event.touches[0];
    var currentTime = Date.now();

    var currentDeltaX = this.lastTouchX - touch.clientX;
    var currentDeltaY = this.lastTouchY - touch.clientY;

    var movementDistance = Math.sqrt(
      currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY
    );

    if (movementDistance > this.options.touchStopThreshold) {
      if (this.touchStopTimer) {
        clearTimeout(this.touchStopTimer);
        this.touchStopTimer = null;
      }

      var timeDelta = currentTime - this.lastTouchTime;
      if (timeDelta > 0) {
        this.touchVelocityX = currentDeltaX / timeDelta;
        this.touchVelocityY = currentDeltaY / timeDelta;
      }

      var adjustedDeltaX =
        currentDeltaX *
        this.options.horizontalSensitivity *
        this.options.touchMultiplier;
      var adjustedDeltaY =
        currentDeltaY *
        this.options.verticalSensitivity *
        this.options.touchMultiplier;

      // 🚨 데모와 완전히 동일한 로직: 모달이 열려있을 때만 preventScroll 호출
      if (this.isModalOpen) {
        this.preventScroll(event); // preventScroll을 통해 모달 내부/외부 구분 처리
        if (this.options.debug) {
          console.log("🎭 모달 모드: onTouchMove - preventScroll 호출");
        }
      } else if (Math.abs(adjustedDeltaX) > 3 || Math.abs(adjustedDeltaY) > 3) {
        var combinedDelta = this.calculateCombinedDelta(
          adjustedDeltaX,
          adjustedDeltaY
        );
        this.addToScroll(combinedDelta);
      }

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.lastTouchTime = currentTime;
      this.touchMoveCount++;
    } else {
      var self = this;
      if (!this.touchStopTimer) {
        this.touchStopTimer = setTimeout(function () {
          self.touchVelocityX *= 0.8;
          self.touchVelocityY *= 0.8;
          self.touchStopTimer = null;
        }, 100);
      }
    }
  };

  // 터치 종료 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.onTouchEnd = function (event) {
    if (this.options.disabled) return;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    var touch = event.changedTouches[0];
    var deltaTime = Date.now() - this.touchStartTime;
    var totalDeltaY = this.touchStartY - touch.clientY;

    if (
      deltaTime < 300 &&
      Math.abs(totalDeltaY) > 50 &&
      this.touchMoveCount > 3
    ) {
      var velocity = this.touchVelocityY;
      var flingMultiplier = this.options.flingMultiplier || 1.0;
      var flingDistance = velocity * 400 * flingMultiplier;

      if (Math.abs(flingDistance) > 50) {
        this.addToScroll(flingDistance);

        if (this.options.debug) {
          console.log("🚀 플링 제스처:", {
            velocity: velocity,
            flingDistance: flingDistance,
            modalMode: this.isModalOpen ? "차단됨" : "허용됨",
          });
        }
      }
    }

    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;
  };

  // 델타 계산 (각도 기반 우선)
  TwoDimensionScroll.prototype.calculateCombinedDelta = function (
    deltaX,
    deltaY
  ) {
    // 🆕 각도 기반 방향 결정 (최우선 처리)
    if (this.options.useAngleBasedDirection) {
      var horizontalThreshold = this.options.horizontalAngleThreshold || 20; // 기본값: 20도

      // 각도 계산 (라디안 -> 도)
      var angle =
        Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI);

      if (this.options.debug) {
        console.log("📐 각도 기반 방향 결정 (최우선):", {
          deltaX: deltaX.toFixed(1),
          deltaY: deltaY.toFixed(1),
          각도: angle.toFixed(1) + "°",
          임계각도: horizontalThreshold + "°",
          결정방향: angle <= horizontalThreshold ? "가로" : "세로",
        });
      }

      // 🚀 개선된 로직: 방향에 따라 순수한 축 값만 반환
      if (angle <= horizontalThreshold) {
        // 가로 스크롤: X축만 사용, Y축 완전 무시
        return deltaX;
      } else {
        // 세로 스크롤: Y축만 사용, X축 완전 무시
        // 🎯 핵심 개선: 대각선 벡터의 전체 크기를 Y축으로 투영
        var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY); // 벡터 전체 크기

        // 터치 시작 시 주요 방향 결정 (한 번만)
        if (!this.touchDirectionLocked) {
          // 초기 Y축 방향 결정 (양수면 아래, 음수면 위)
          this.verticalScrollDirection = deltaY > 0 ? "down" : "up";
          this.touchDirectionLocked = true;

          if (this.options.debug) {
            console.log("🎯 대각선 벡터 → Y축 투영:", {
              방향: this.verticalScrollDirection,
              deltaX: deltaX.toFixed(1),
              deltaY: deltaY.toFixed(1),
              벡터크기: magnitude.toFixed(1),
              기존deltaY: deltaY.toFixed(1),
            });
          }
        }

        // 🚀 핵심: 벡터 전체 크기를 고정된 방향으로 적용
        if (this.verticalScrollDirection === "down") {
          return magnitude; // 벡터 전체 크기를 아래 방향으로
        } else {
          return -magnitude; // 벡터 전체 크기를 위 방향으로
        }
      }
    }

    // 🆕 터치 방향 고정 모드 적용 (각도 기반이 비활성화된 경우에만)
    if (this.options.lockTouchDirection) {
      var threshold = this.options.touchDirectionThreshold || 15;
      var allowDirectionChange = this.options.allowDirectionChange !== false; // 기본값: true
      var changeThreshold = this.options.directionChangeThreshold || 25;
      var smoothness = this.options.directionChangeSmoothness || 0.3;

      // 델타 스무딩 적용
      this.smoothedDeltaX =
        this.smoothedDeltaX * (1 - smoothness) + deltaX * smoothness;
      this.smoothedDeltaY =
        this.smoothedDeltaY * (1 - smoothness) + deltaY * smoothness;

      // 방향이 아직 결정되지 않았고, 충분한 이동이 있는 경우
      if (
        !this.touchDirectionLocked &&
        (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)
      ) {
        // Y축 우선 모드 적용
        if (this.options.prioritizeVertical) {
          this.touchDirection =
            Math.abs(deltaY) > 5 ? "vertical" : "horizontal";
        } else {
          // 기본 모드: 더 큰 값으로 방향 결정
          this.touchDirection =
            Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        }
        this.touchDirectionLocked = true;
        this.oppositeDirectionCount = 0;

        if (this.options.debug) {
          console.log("🔒 터치 방향 고정:", {
            방향: this.touchDirection,
            deltaX: deltaX.toFixed(1),
            deltaY: deltaY.toFixed(1),
            임계값: threshold,
          });
        }
      }

      // 방향이 고정된 경우
      if (this.touchDirectionLocked && allowDirectionChange) {
        // 🆕 스마트 방향 전환 감지
        var isHorizontalLocked = this.touchDirection === "horizontal";
        var currentPrimaryDelta = isHorizontalLocked ? deltaX : deltaY;
        var currentSecondaryDelta = isHorizontalLocked ? deltaY : deltaX;

        // 반대 방향으로의 강한 움직임 감지
        if (
          Math.abs(currentSecondaryDelta) > Math.abs(currentPrimaryDelta) &&
          Math.abs(currentSecondaryDelta) > changeThreshold
        ) {
          this.oppositeDirectionCount++;

          if (this.oppositeDirectionCount === 1) {
            this.directionChangeStartTime = Date.now();
          }

          // 일정 횟수 이상 반대 방향으로 움직이면 방향 전환
          if (this.oppositeDirectionCount >= 3) {
            this.touchDirection = isHorizontalLocked
              ? "vertical"
              : "horizontal";
            this.oppositeDirectionCount = 0;

            if (this.options.debug) {
              console.log("🔄 터치 방향 전환:", {
                새방향: this.touchDirection,
                전환시간: Date.now() - this.directionChangeStartTime + "ms",
                primaryDelta: currentPrimaryDelta.toFixed(1),
                secondaryDelta: currentSecondaryDelta.toFixed(1),
              });
            }
          }
        } else {
          // 반대 방향 카운트 리셋 (점진적으로)
          this.oppositeDirectionCount = Math.max(
            0,
            this.oppositeDirectionCount - 0.5
          );
        }

        // 스무딩된 델타 사용하여 부드러운 전환
        var finalDelta =
          this.touchDirection === "horizontal"
            ? this.smoothedDeltaX
            : this.smoothedDeltaY;

        // 이전 값과의 급격한 변화 방지
        var maxChange = 50; // 최대 변화량 제한
        if (this.lastDeltaX !== 0 || this.lastDeltaY !== 0) {
          var lastFinalDelta =
            this.touchDirection === "horizontal"
              ? this.lastDeltaX
              : this.lastDeltaY;
          var deltaChange = Math.abs(finalDelta - lastFinalDelta);

          if (deltaChange > maxChange) {
            var clampedDelta =
              lastFinalDelta +
              Math.sign(finalDelta - lastFinalDelta) * maxChange;
            this.lastDeltaX =
              this.touchDirection === "horizontal" ? clampedDelta : deltaX;
            this.lastDeltaY =
              this.touchDirection === "vertical" ? clampedDelta : deltaY;
            return clampedDelta;
          }
        }

        this.lastDeltaX = deltaX;
        this.lastDeltaY = deltaY;
        return finalDelta;
      }

      // 방향이 고정된 경우 (방향 전환 비활성화)
      if (this.touchDirectionLocked) {
        return this.touchDirection === "horizontal" ? deltaX : deltaY;
      }
    }

    // 🆕 Y축 우선 모드 적용 (다른 모드가 모두 비활성화된 경우)
    if (this.options.prioritizeVertical) {
      // Y축 우선: Y값이 0이 아니면 무조건 Y축, 0이면 X축
      return deltaY !== 0 ? deltaY : deltaX;
    }

    // 기존 로직
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);

    if (absX > absY * 0.7) {
      return deltaX;
    }

    if (absY > absX * 0.7) {
      return deltaY;
    }

    var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var angle = Math.atan2(deltaY, deltaX);

    if (Math.abs(angle) < Math.PI / 3 || Math.abs(angle) > (2 * Math.PI) / 3) {
      return deltaX > 0 ? magnitude : -magnitude;
    } else {
      return deltaY > 0 ? magnitude : -magnitude;
    }
  };

  // === 모달 제어 API - 데모와 완전히 동일 ===
  TwoDimensionScroll.prototype.pauseForModal = function () {
    this.isModalOpen = true;

    // 현재 스크롤 위치 저장 (position: fixed로 인한 위치 초기화 방지)
    this.savedScrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // 바디 스크롤 완전 차단을 위한 CSS 클래스 추가
    if (document.body) {
      document.body.classList.add("twodimension-modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.top = "-" + this.savedScrollPosition + "px";
    }

    // HTML 요소에도 적용
    if (document.documentElement) {
      document.documentElement.style.overflow = "hidden";
    }

    if (this.options.debug) {
      console.log("🎭 모달 모드 활성화: body 스크롤 완전 차단", {
        저장된_위치: this.savedScrollPosition + "px",
      });
    }
  };

  TwoDimensionScroll.prototype.resumeFromModal = function () {
    this.isModalOpen = false;

    // 바디 스크롤 차단 해제
    if (document.body) {
      document.body.classList.remove("twodimension-modal-open");
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.top = "";
    }

    // HTML 요소 스타일도 복원
    if (document.documentElement) {
      document.documentElement.style.overflow = "";
    }

    // 🔥 터치 상태 완전 리셋 (모바일 먹통 방지)
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastTouchTime = 0;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    // 저장된 스크롤 위치로 복원
    if (typeof this.savedScrollPosition === "number") {
      window.scrollTo(0, this.savedScrollPosition);
      this.targetScroll = this.savedScrollPosition;
      this.animatedScroll = this.savedScrollPosition;
    }

    if (this.options.debug) {
      console.log("🎭 모달 모드 해제: body 스크롤 재개 + 터치 상태 리셋", {
        복원된_위치: this.savedScrollPosition + "px",
        터치상태리셋: "완료",
      });
    }
  };

  TwoDimensionScroll.prototype.isInModalMode = function () {
    return this.isModalOpen || false;
  };

  // 스크롤 추가
  TwoDimensionScroll.prototype.addToScroll = function (delta) {
    // 🚨 NaN 방지를 위한 안전한 값 처리
    if (isNaN(delta)) {
      console.error("❌ addToScroll에 NaN delta가 전달됨:", delta);
      return;
    }

    // 🚨 targetScroll 초기화 확인
    if (isNaN(this.targetScroll) || this.targetScroll === undefined) {
      console.warn(
        "⚠️ targetScroll이 NaN이거나 undefined입니다. 0으로 초기화합니다."
      );
      this.targetScroll = 0;
    }

    var maxScrollTop = getMaxScrollTop();
    var oldTargetScroll = this.targetScroll;
    this.targetScroll = clamp(this.targetScroll + delta, 0, maxScrollTop);

    // 🚨 결과값 NaN 검증
    if (isNaN(this.targetScroll)) {
      console.error("❌ targetScroll 계산 결과가 NaN입니다:", {
        oldTarget: oldTargetScroll,
        delta: delta,
        maxScrollTop: maxScrollTop,
      });
      this.targetScroll = oldTargetScroll; // 이전 값으로 복원
      return;
    }

    if (this.options.debug) {
      console.log("📊 addToScroll 호출:", {
        delta: Math.round(delta * 100) / 100,
        oldTarget: Math.round(oldTargetScroll),
        newTarget: Math.round(this.targetScroll),
        maxScrollTop: maxScrollTop,
        rafId: this.rafId ? "실행중" : "정지됨",
        차이: Math.abs(this.targetScroll - oldTargetScroll),
        애니메이션조건:
          Math.abs(this.targetScroll - oldTargetScroll) > 0.1 && !this.rafId
            ? "✅ 시작"
            : "❌ 건너뜀",
      });
    }

    if (Math.abs(this.targetScroll - oldTargetScroll) > 0.1 && !this.rafId) {
      if (this.options.debug) {
        console.log("🔄 애니메이션 재시작:", {
          oldTarget: Math.round(oldTargetScroll),
          newTarget: Math.round(this.targetScroll),
          delta: Math.round(delta),
        });
      }
      this.startAnimationLoop();
    }
  };

  // 공개 메서드들
  TwoDimensionScroll.prototype.scrollTo = function (position, options) {
    var maxScrollTop = getMaxScrollTop();
    this.targetScroll = clamp(position, 0, maxScrollTop);

    if (options && options.immediate) {
      this.animatedScroll = this.targetScroll;
      window.scrollTo(0, this.animatedScroll);
    }

    if (
      !this.rafId &&
      Math.abs(this.targetScroll - this.animatedScroll) > 0.1
    ) {
      this.startAnimationLoop();
    }
  };

  TwoDimensionScroll.prototype.on = function (callback) {
    this.scrollCallbacks.push(callback);
  };

  TwoDimensionScroll.prototype.off = function (callback) {
    var index = this.scrollCallbacks.indexOf(callback);
    if (index > -1) {
      this.scrollCallbacks.splice(index, 1);
    }
  };

  TwoDimensionScroll.prototype.disable = function () {
    this.options.disabled = true;
  };

  TwoDimensionScroll.prototype.enable = function () {
    this.options.disabled = false;
  };

  // 🚨 스크롤바 제어 메서드들 - 데모와 완전히 동일
  TwoDimensionScroll.prototype.showScrollbar = function (show) {
    if (typeof show === "boolean") {
      this.options.ui.hideScrollbar = !show;
    }
    this.setupScrollbarStyles(); // 스타일 재적용
  };

  TwoDimensionScroll.prototype.toggleScrollbar = function () {
    this.options.ui.hideScrollbar = !this.options.ui.hideScrollbar;
    this.setupScrollbarStyles(); // 스타일 재적용
  };

  TwoDimensionScroll.prototype.getScrollbarVisibility = function () {
    return {
      visible: !this.options.ui.hideScrollbar,
      hideScrollbar: this.options.ui.hideScrollbar,
    };
  };

  TwoDimensionScroll.prototype.isScrollbarVisible = function () {
    return !this.options.ui.hideScrollbar; // 현재 표시 상태 반환
  };

  TwoDimensionScroll.prototype.getCurrentPosition = function () {
    return this.animatedScroll;
  };

  TwoDimensionScroll.prototype.getMaxPosition = function () {
    return getMaxScrollTop();
  };

  // 정리
  TwoDimensionScroll.prototype.destroy = function () {
    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    if (this.rafId) {
      cancelRaf(this.rafId);
      this.rafId = null;
    }

    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }

    // 🚨 스크롤바 스타일 요소도 제거
    if (this.scrollbarStyleElement && this.scrollbarStyleElement.parentNode) {
      this.scrollbarStyleElement.parentNode.removeChild(
        this.scrollbarStyleElement
      );
      this.scrollbarStyleElement = null;
    }

    try {
      document.removeEventListener("wheel", this.preventScroll);
      document.removeEventListener("touchmove", this.preventScroll);
    } catch (e) {}

    this.scrollCallbacks = [];
    this.targetScroll = 0;
    this.animatedScroll = 0;
    this.isScrolling = false;
    this.isAnimating = false;
    this.isModalOpen = false;

    console.log("🗑️ TwoDimensionScroll 해제 완료 (React Hook 버전)");
  };

  TwoDimensionScroll.prototype.cleanup = function () {
    return this.destroy.bind(this);
  };

  return TwoDimensionScroll;
}

/**
 * 🚀 데모와 완전히 동일한 성능의 React Hook
 */
export function useTwoDimensionScroll(options = {}, config = {}) {
  const [isReady, setIsReady] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollInfo, setScrollInfo] = useState({
    position: 0,
    maxPosition: 0,
    progress: 0,
  });
  const instanceRef = useRef(null);

  useEffect(() => {
    const initializeScroll = () => {
      try {
        // 🚨 데모와 완전히 동일한 클래스 생성
        const TwoDimensionScrollClass = createTwoDimensionScrollClass();

        // 🚨 데모와 완전히 동일한 옵션으로 초기화
        const defaultOptions = {
          debug: true,
          desktop: {
            duration: 1000,
            horizontalSensitivity: 1.2,
            verticalSensitivity: 1.5,
            lerp: 0.1,
            wheelMultiplier: 1.1,
            precisionMode: true,
            keyboardScrollAmount: 0.8,
          },
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

        // 사용자 옵션과 기본 옵션 병합
        const mergedOptions = { ...defaultOptions, ...options };

        const instance = new TwoDimensionScrollClass(mergedOptions);
        instanceRef.current = instance;

        // 🚨 데모와 동일한 스크롤 이벤트 리스너
        const handleScroll = (eventData) => {
          setScrollPosition(eventData.scrollTop);
          setScrollInfo({
            position: eventData.scrollTop,
            maxPosition: instance.getMaxPosition?.() || 0,
            progress:
              instance.getMaxPosition?.() > 0
                ? (eventData.scrollTop / instance.getMaxPosition()) * 100
                : 0,
          });

          // 🚨 데모와 동일한 디버그 로그
          if (mergedOptions.debug) {
            console.log("📊 스크롤 이벤트:", {
              type: eventData.type,
              deltaY: Math.round(eventData.deltaY),
              scrollTop: Math.round(eventData.scrollTop),
              direction: eventData.direction === 1 ? "아래" : "위",
            });
          }
        };

        instance.on(handleScroll);
        setIsReady(true);
      } catch (error) {
        console.error("❌ React Hook 초기화 실패:", error);
      }
    };

    // 🚨 데모와 동일한 지연 시간
    const timer = setTimeout(initializeScroll, 100);

    return () => {
      clearTimeout(timer);
      if (instanceRef.current) {
        instanceRef.current.cleanup?.();
      }
    };
  }, []);

  const scrollTo = useCallback((position) => {
    if (instanceRef.current && instanceRef.current.scrollTo) {
      instanceRef.current.scrollTo(position);
    }
  }, []);

  return {
    isReady,
    scrollPosition,
    scrollInfo,
    scrollTo,
    instance: instanceRef.current,
  };
}

export default useTwoDimensionScroll;
