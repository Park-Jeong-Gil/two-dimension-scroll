/**
 * TwoDimensionScroll - 완전한 번들 버전
 * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환하는 라이브러리
 */
export interface TwoDimensionScrollOptions {
    duration?: number;
    easing?: (t: number) => number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    disabled?: boolean;
    useNativeScrollOnMobile?: boolean;
    scrollableSelector?: string;
    debug?: boolean;
}
export interface ScrollEventData {
    deltaX: number;
    deltaY: number;
    scrollTop: number;
    direction: number;
    type: "wheel" | "touch" | "keyboard";
}
export interface AnimationFrame {
    startTime: number;
    startPosition: number;
    targetPosition: number;
    duration: number;
    easing: (t: number) => number;
}
export type ScrollCallback = (data: ScrollEventData) => void;
export declare const Easing: {
    readonly linear: (t: number) => number;
    readonly easeInQuad: (t: number) => number;
    readonly easeOutQuad: (t: number) => number;
    readonly easeInOutQuad: (t: number) => number;
    readonly easeInCubic: (t: number) => number;
    readonly easeOutCubic: (t: number) => number;
    readonly easeInOutCubic: (t: number) => number;
};
export declare class TwoDimensionScroll {
    private options;
    private isAnimating;
    private animationFrame;
    private rafId;
    private lastScrollTop;
    private touchStartY;
    private touchStartX;
    private touchStartTime;
    private isScrolling;
    private scrollCallbacks;
    private isMobileDevice;
    private passive;
    constructor(options?: TwoDimensionScrollOptions);
    private init;
    private bindEvents;
    private onWheel;
    private onTouchStart;
    private onTouchMove;
    private onTouchEnd;
    private onKeyDown;
    private onResize;
    private calculateCombinedDelta;
    private handleScroll;
    private smoothScrollTo;
    private animate;
    scrollTo(position: number, duration?: number): void;
    on(callback: ScrollCallback): void;
    off(callback: ScrollCallback): void;
    disable(): void;
    enable(): void;
    updateOptions(newOptions: Partial<TwoDimensionScrollOptions>): void;
    getCurrentPosition(): number;
    getMaxPosition(): number;
    destroy(): void;
    private log;
}
export default TwoDimensionScroll;
//# sourceMappingURL=bundle.d.ts.map