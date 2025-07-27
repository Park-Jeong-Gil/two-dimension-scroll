/**
 * 모바일 디바이스 감지
 */
export function isMobile() {
    if (typeof window === "undefined")
        return false;
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768);
}
/**
 * 터치 디바이스 감지
 */
export function isTouchDevice() {
    if (typeof window === "undefined")
        return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
/**
 * 값을 특정 범위로 제한
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * 선형 보간
 */
export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
/**
 * 스크롤 가능한 최대 높이 계산
 */
export function getMaxScrollTop() {
    if (typeof document === "undefined")
        return 0;
    return Math.max(document.body.scrollHeight - window.innerHeight, document.documentElement.scrollHeight - window.innerHeight, 0);
}
/**
 * 현재 스크롤 위치 가져오기
 */
export function getCurrentScrollTop() {
    if (typeof window === "undefined")
        return 0;
    return (window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0);
}
/**
 * RAF 폴리필
 */
export const raf = (() => {
    if (typeof window === "undefined")
        return (callback) => setTimeout(callback, 16);
    return (window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        ((callback) => setTimeout(callback, 16)));
})();
/**
 * cancelAnimationFrame 폴리필
 */
export const cancelRaf = (() => {
    if (typeof window === "undefined")
        return clearTimeout;
    return (window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        clearTimeout);
})();
/**
 * 패시브 이벤트 리스너 지원 확인
 */
export function supportsPassive() {
    if (typeof window === "undefined")
        return false;
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, "passive", {
            get() {
                supportsPassive = true;
                return true;
            },
        });
        window.addEventListener("testPassive", () => { }, opts);
        window.removeEventListener("testPassive", () => { }, opts);
    }
    catch (e) { }
    return supportsPassive;
}
/**
 * 디바운스 함수
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
}
/**
 * 쓰로틀 함수
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
//# sourceMappingURL=utils.js.map