var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./types", "./utils", "./types", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TwoDimensionScroll = void 0;
    const types_1 = require("./types");
    const utils_1 = require("./utils");
    /**
     * 2차원 스크롤 라이브러리
     * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환
     */
    class TwoDimensionScroll {
        constructor(options = {}) {
            this.isAnimating = false;
            this.animationFrame = null;
            this.rafId = null;
            this.lastScrollTop = 0;
            this.touchStartY = 0;
            this.touchStartX = 0;
            this.touchStartTime = 0;
            this.isScrolling = false;
            this.scrollCallbacks = new Set();
            this.isMobileDevice = false;
            this.passive = false;
            /**
             * 휠 이벤트 핸들러
             */
            this.onWheel = (event) => {
                if (this.options.disabled || this.isScrolling)
                    return;
                event.preventDefault();
                const deltaX = event.deltaX * this.options.horizontalSensitivity;
                const deltaY = event.deltaY * this.options.verticalSensitivity;
                // 디버그 모드에서 원시 이벤트 데이터 출력
                if (this.options.debug) {
                    console.log("🖱️ 휠 이벤트:", {
                        원시_deltaX: event.deltaX,
                        원시_deltaY: event.deltaY,
                        조정된_deltaX: deltaX,
                        조정된_deltaY: deltaY,
                        deltaMode: event.deltaMode,
                        가로스크롤_감지: Math.abs(deltaX) > Math.abs(deltaY) ? "✅ YES" : "❌ NO",
                    });
                }
                // 가로와 세로 스크롤 조합 처리
                const combinedDelta = this.calculateCombinedDelta(deltaX, deltaY);
                this.handleScroll(combinedDelta, "wheel");
            };
            /**
             * 터치 시작 이벤트 핸들러
             */
            this.onTouchStart = (event) => {
                if (this.options.disabled)
                    return;
                const touch = event.touches[0];
                this.touchStartX = touch.clientX;
                this.touchStartY = touch.clientY;
                this.touchStartTime = Date.now();
            };
            /**
             * 터치 이동 이벤트 핸들러
             */
            this.onTouchMove = (event) => {
                if (this.options.disabled || this.isScrolling)
                    return;
                const touch = event.touches[0];
                const deltaX = (this.touchStartX - touch.clientX) * this.options.horizontalSensitivity;
                const deltaY = (this.touchStartY - touch.clientY) * this.options.verticalSensitivity;
                // 의미있는 이동이 있을 때만 처리
                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    event.preventDefault();
                    const combinedDelta = this.calculateCombinedDelta(deltaX, deltaY);
                    this.handleScroll(combinedDelta, "touch");
                }
            };
            /**
             * 터치 종료 이벤트 핸들러
             */
            this.onTouchEnd = (event) => {
                if (this.options.disabled)
                    return;
                // 플링 제스처 처리 (빠른 스와이프)
                const touch = event.changedTouches[0];
                const deltaTime = Date.now() - this.touchStartTime;
                const deltaY = this.touchStartY - touch.clientY;
                if (deltaTime < 300 && Math.abs(deltaY) > 50) {
                    const velocity = deltaY / deltaTime;
                    const flingDistance = velocity * 200; // 플링 거리 계산
                    this.handleScroll(flingDistance, "touch");
                }
            };
            /**
             * 키보드 이벤트 핸들러
             */
            this.onKeyDown = (event) => {
                if (this.options.disabled || this.isScrolling)
                    return;
                let delta = 0;
                const scrollAmount = window.innerHeight * 0.8; // 화면 높이의 80%
                switch (event.key) {
                    case "ArrowUp":
                    case "PageUp":
                        delta = -scrollAmount;
                        break;
                    case "ArrowDown":
                    case "PageDown":
                    case " ": // 스페이스바
                        delta = scrollAmount;
                        break;
                    case "Home":
                        delta = -(0, utils_1.getCurrentScrollTop)();
                        break;
                    case "End":
                        delta = (0, utils_1.getMaxScrollTop)() - (0, utils_1.getCurrentScrollTop)();
                        break;
                    default:
                        return;
                }
                event.preventDefault();
                this.handleScroll(delta, "keyboard");
            };
            /**
             * 리사이즈 이벤트 핸들러
             */
            this.onResize = () => {
                // 현재 스크롤 위치가 최대값을 초과하지 않도록 조정
                const maxScrollTop = (0, utils_1.getMaxScrollTop)();
                const currentScrollTop = (0, utils_1.getCurrentScrollTop)();
                if (currentScrollTop > maxScrollTop) {
                    this.scrollTo(maxScrollTop);
                }
            };
            /**
             * 애니메이션 실행
             */
            this.animate = () => {
                if (!this.animationFrame)
                    return;
                const now = performance.now();
                const elapsed = now - this.animationFrame.startTime;
                const progress = Math.min(elapsed / this.animationFrame.duration, 1);
                const easedProgress = this.animationFrame.easing(progress);
                const currentPosition = this.animationFrame.startPosition +
                    (this.animationFrame.targetPosition - this.animationFrame.startPosition) *
                        easedProgress;
                window.scrollTo(0, currentPosition);
                if (progress < 1) {
                    this.rafId = (0, utils_1.raf)(this.animate);
                }
                else {
                    this.isAnimating = false;
                    this.isScrolling = false;
                    this.animationFrame = null;
                    this.rafId = null;
                }
            };
            this.options = {
                duration: 1000,
                easing: types_1.Easing.easeOutCubic,
                horizontalSensitivity: 1,
                verticalSensitivity: 1,
                disabled: false,
                useNativeScrollOnMobile: true,
                scrollableSelector: "body",
                debug: false,
                ...options,
            };
            this.isMobileDevice = (0, utils_1.isMobile)();
            this.passive = (0, utils_1.supportsPassive)() ? { passive: false } : false;
            this.lastScrollTop = (0, utils_1.getCurrentScrollTop)();
            this.init();
        }
        /**
         * 라이브러리 초기화
         */
        init() {
            if (typeof window === "undefined")
                return;
            // 모바일에서 네이티브 스크롤 사용 시 초기화하지 않음
            if (this.isMobileDevice && this.options.useNativeScrollOnMobile) {
                this.log("모바일 네이티브 스크롤 모드");
                return;
            }
            this.bindEvents();
            this.log("TwoDimensionScroll 초기화 완료");
        }
        /**
         * 이벤트 바인딩
         */
        bindEvents() {
            // 휠 이벤트 (데스크톱)
            document.addEventListener("wheel", this.onWheel, this.passive);
            // 터치 이벤트 (모바일/태블릿)
            if ((0, utils_1.isTouchDevice)()) {
                document.addEventListener("touchstart", this.onTouchStart, this.passive);
                document.addEventListener("touchmove", this.onTouchMove, this.passive);
                document.addEventListener("touchend", this.onTouchEnd, this.passive);
            }
            // 키보드 이벤트
            document.addEventListener("keydown", this.onKeyDown);
            // 리사이즈 이벤트
            window.addEventListener("resize", (0, utils_1.throttle)(this.onResize, 100));
        }
        /**
         * 가로와 세로 델타를 조합하여 최종 델타 계산
         */
        calculateCombinedDelta(deltaX, deltaY) {
            // 가로 스크롤이 더 큰 경우, 가로 스크롤을 세로로 변환
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                return deltaX; // 가로 스크롤을 세로로 변환
            }
            // 세로 스크롤이 더 크거나 같은 경우
            if (Math.abs(deltaY) >= Math.abs(deltaX)) {
                return deltaY;
            }
            // 가로와 세로가 동시에 발생한 경우, 벡터 합 계산
            const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            // 각도에 따라 방향 결정 (-45도 ~ 45도는 가로, 나머지는 세로)
            if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > (3 * Math.PI) / 4) {
                return deltaX > 0 ? magnitude : -magnitude; // 가로 방향
            }
            else {
                return deltaY > 0 ? magnitude : -magnitude; // 세로 방향
            }
        }
        /**
         * 스크롤 처리
         */
        handleScroll(delta, type) {
            if (Math.abs(delta) < 1)
                return;
            const currentScrollTop = (0, utils_1.getCurrentScrollTop)();
            const maxScrollTop = (0, utils_1.getMaxScrollTop)();
            const targetScrollTop = (0, utils_1.clamp)(currentScrollTop + delta, 0, maxScrollTop);
            // 스크롤할 필요가 없으면 리턴
            if (Math.abs(targetScrollTop - currentScrollTop) < 1)
                return;
            const direction = delta > 0 ? 1 : -1;
            const eventData = {
                deltaX: 0,
                deltaY: delta,
                scrollTop: currentScrollTop,
                direction,
                type,
            };
            // 콜백 실행
            this.scrollCallbacks.forEach((callback) => callback(eventData));
            // 부드러운 스크롤 실행
            this.smoothScrollTo(targetScrollTop);
        }
        /**
         * 부드러운 스크롤 실행
         */
        smoothScrollTo(targetPosition) {
            if (this.isAnimating) {
                (0, utils_1.cancelRaf)(this.rafId);
            }
            const startPosition = (0, utils_1.getCurrentScrollTop)();
            const distance = targetPosition - startPosition;
            if (Math.abs(distance) < 1)
                return;
            this.animationFrame = {
                startTime: performance.now(),
                startPosition,
                targetPosition,
                duration: this.options.duration,
                easing: this.options.easing,
            };
            this.isAnimating = true;
            this.isScrolling = true;
            this.animate();
        }
        /**
         * 특정 위치로 스크롤
         */
        scrollTo(position, duration) {
            const maxScrollTop = (0, utils_1.getMaxScrollTop)();
            const targetPosition = (0, utils_1.clamp)(position, 0, maxScrollTop);
            if (duration !== undefined) {
                const originalDuration = this.options.duration;
                this.options.duration = duration;
                this.smoothScrollTo(targetPosition);
                this.options.duration = originalDuration;
            }
            else {
                this.smoothScrollTo(targetPosition);
            }
        }
        /**
         * 스크롤 콜백 추가
         */
        on(callback) {
            this.scrollCallbacks.add(callback);
        }
        /**
         * 스크롤 콜백 제거
         */
        off(callback) {
            this.scrollCallbacks.delete(callback);
        }
        /**
         * 스크롤 비활성화
         */
        disable() {
            this.options.disabled = true;
            this.log("스크롤 비활성화");
        }
        /**
         * 스크롤 활성화
         */
        enable() {
            this.options.disabled = false;
            this.log("스크롤 활성화");
        }
        /**
         * 옵션 업데이트
         */
        updateOptions(newOptions) {
            this.options = { ...this.options, ...newOptions };
            this.log("옵션 업데이트", newOptions);
        }
        /**
         * 현재 스크롤 위치 가져오기
         */
        getCurrentPosition() {
            return (0, utils_1.getCurrentScrollTop)();
        }
        /**
         * 최대 스크롤 위치 가져오기
         */
        getMaxPosition() {
            return (0, utils_1.getMaxScrollTop)();
        }
        /**
         * 라이브러리 해제
         */
        destroy() {
            // 애니메이션 중단
            if (this.isAnimating && this.rafId) {
                (0, utils_1.cancelRaf)(this.rafId);
            }
            // 이벤트 리스너 제거
            document.removeEventListener("wheel", this.onWheel);
            document.removeEventListener("touchstart", this.onTouchStart);
            document.removeEventListener("touchmove", this.onTouchMove);
            document.removeEventListener("touchend", this.onTouchEnd);
            document.removeEventListener("keydown", this.onKeyDown);
            window.removeEventListener("resize", this.onResize);
            // 상태 초기화
            this.isAnimating = false;
            this.isScrolling = false;
            this.animationFrame = null;
            this.rafId = null;
            this.scrollCallbacks.clear();
            this.log("TwoDimensionScroll 해제");
        }
        /**
         * 디버그 로그
         */
        log(...args) {
            if (this.options.debug) {
                console.log("[TwoDimensionScroll]", ...args);
            }
        }
    }
    exports.TwoDimensionScroll = TwoDimensionScroll;
    // 기본 내보내기
    exports.default = TwoDimensionScroll;
    // 타입과 유틸리티도 함께 내보내기
    __exportStar(require("./types"), exports);
    __exportStar(require("./utils"), exports);
    // 브라우저 전역 변수로 설정 (CDN 사용 시)
    if (typeof window !== "undefined") {
        window.TwoDimensionScroll = TwoDimensionScroll;
    }
});
//# sourceMappingURL=index.js.map