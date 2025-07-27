// ES Module version of TwoDimensionScroll
// Auto-generated from index.js

import { Easing } from "./types.js";
import { clamp, lerp } from "./utils.js";

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

    // Default options
    this.options = {
      duration: 1000,
      easing: Easing.easeOutCubic,
      horizontalSensitivity: 1.2,
      verticalSensitivity: 1.0,
      disabled: false,
      useNativeScrollOnMobile: true,
      scrollableSelector: "body",
      debug: false,
      ...options,
    };

    this.init();
  }

  init() {
    this.isMobileDevice = this.detectMobile();

    if (this.options.useNativeScrollOnMobile && this.isMobileDevice) {
      if (this.options.debug) {
        console.log(
          "[TwoDimensionScroll] Using native scroll on mobile device"
        );
      }
      return;
    }

    this.bindEvents();
    this.disableDefaultScroll();

    if (this.options.debug) {
      console.log(
        "[TwoDimensionScroll] Initialized with options:",
        this.options
      );
    }
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  bindEvents() {
    document.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });
    document.addEventListener("touchstart", this.onTouchStart.bind(this), {
      passive: false,
    });
    document.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener("touchend", this.onTouchEnd.bind(this), {
      passive: false,
    });
    document.addEventListener("keydown", this.onKeyDown.bind(this), {
      passive: false,
    });
    window.addEventListener("resize", this.onResize.bind(this));
  }

  onWheel(event) {
    if (this.options.disabled || this.isAnimating) return;

    event.preventDefault();

    const deltaX = event.deltaX * this.options.horizontalSensitivity;
    const deltaY = event.deltaY * this.options.verticalSensitivity;

    // Convert horizontal scroll to vertical
    const combinedDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    this.scroll(combinedDelta);

    if (this.options.debug) {
      console.log("[TwoDimensionScroll] Wheel event:", {
        deltaX,
        deltaY,
        combinedDelta,
      });
    }
  }

  onTouchStart(event) {
    if (this.options.disabled) return;

    const touch = event.touches[0];
    this.touchStartY = touch.clientY;
    this.touchStartX = touch.clientX;
    this.touchStartTime = Date.now();
  }

  onTouchMove(event) {
    if (this.options.disabled || this.isAnimating) return;

    event.preventDefault();

    const touch = event.touches[0];
    const deltaY = this.touchStartY - touch.clientY;
    const deltaX = this.touchStartX - touch.clientX;

    // Convert horizontal swipe to vertical scroll
    const combinedDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    if (Math.abs(combinedDelta) > 5) {
      this.scroll(combinedDelta);
    }
  }

  onTouchEnd(event) {
    // Handle momentum scrolling if needed
  }

  onKeyDown(event) {
    if (this.options.disabled || this.isAnimating) return;

    let delta = 0;
    const viewportHeight = window.innerHeight;

    switch (event.key) {
      case "ArrowUp":
        delta = -viewportHeight * 0.1;
        break;
      case "ArrowDown":
        delta = viewportHeight * 0.1;
        break;
      case "PageUp":
        delta = -viewportHeight * 0.8;
        break;
      case "PageDown":
        delta = viewportHeight * 0.8;
        break;
      case "Home":
        this.scrollTo(0);
        return;
      case "End":
        this.scrollTo(document.body.scrollHeight);
        return;
    }

    if (delta !== 0) {
      event.preventDefault();
      this.scroll(delta);
    }
  }

  onResize() {
    // Handle resize events if needed
  }

  scroll(delta) {
    const currentScroll = window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const targetScroll = clamp(currentScroll + delta, 0, maxScroll);

    if (Math.abs(targetScroll - currentScroll) < 1) return;

    this.scrollTo(targetScroll);
  }

  scrollTo(targetPosition, duration) {
    if (this.isAnimating) {
      cancelAnimationFrame(this.animationFrame);
    }

    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const animationDuration = duration || this.options.duration;
    const startTime = performance.now();

    this.isAnimating = true;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = this.options.easing(progress);
      const currentPosition = startPosition + distance * easedProgress;

      window.scrollTo(0, currentPosition);

      // Notify callbacks
      this.notifyCallbacks({
        scrollTop: currentPosition,
        progress: progress,
        direction: distance > 0 ? "down" : "up",
        type: "scroll",
      });

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  notifyCallbacks(data) {
    this.scrollCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[TwoDimensionScroll] Callback error:", error);
      }
    });
  }

  on(callback) {
    if (typeof callback === "function") {
      this.scrollCallbacks.add(callback);
    }
  }

  off(callback) {
    this.scrollCallbacks.delete(callback);
  }

  disable() {
    this.options.disabled = true;
  }

  enable() {
    this.options.disabled = false;
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  getCurrentPosition() {
    return window.pageYOffset;
  }

  getMaxPosition() {
    return document.body.scrollHeight - window.innerHeight;
  }

  disableDefaultScroll() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Remove event listeners
    document.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onResize);

    // Restore default scroll
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Clear callbacks
    this.scrollCallbacks.clear();

    this.isAnimating = false;
    this.animationFrame = null;
  }
}

// Export for ES modules
export { TwoDimensionScroll as default, Easing };
export * from "./types.js";
export * from "./utils.js";
