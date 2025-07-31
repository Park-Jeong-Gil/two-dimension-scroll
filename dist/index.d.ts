import { TwoDimensionScrollOptions, ScrollCallback } from "./types";
/**
 * 2차원 스크롤 라이브러리
 * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환
 */
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
    private lastTouchY;
    private lastTouchX;
    private lastTouchTime;
    private touchVelocityX;
    private touchVelocityY;
    private touchMoveCount;
    private touchStopTimer;
    private touchDirection;
    private touchDirectionLocked;
    private touchStartDeltaX;
    private touchStartDeltaY;
    private isModalOpen;
    constructor(options?: TwoDimensionScrollOptions);
    /**
     * 라이브러리 초기화
     */
    private init;
    /**
     * 이벤트 바인딩
     */
    private bindEvents;
    /**
     * 휠 이벤트 핸들러 (데모와 동일한 성능)
     */
    private onWheel;
    /**
     * 터치 시작 이벤트 핸들러
     */
    private onTouchStart;
    /**
     * 터치 이동 이벤트 핸들러 (데모와 완전히 동일)
     */
    private onTouchMove;
    /**
     * 터치 종료 이벤트 핸들러 (데모와 완전히 동일)
     */
    private onTouchEnd;
    /**
     * 키보드 이벤트 핸들러
     */
    private onKeyDown;
    /**
     * 리사이즈 이벤트 핸들러
     */
    private onResize;
    /**
     * 가로와 세로 델타를 조합하여 최종 델타 계산
     */
    private calculateCombinedDelta;
    /**
     * 스크롤 처리 (데모 수준 극한 성능)
     */
    private handleScroll;
    /**
     * lenis 스타일 스크롤 추가 함수 (데모와 동일)
     */
    private addToScroll;
    /**
     * lenis 스타일 애니메이션 루프 시작 (데모와 동일)
     */
    private startAnimationLoop;
    private targetScroll;
    /**
     * 부드러운 스크롤 실행 (극한 성능 모드)
     */
    private smoothScrollTo;
    /**
     * 애니메이션 실행
     */
    private animate;
    /**
     * 특정 위치로 스크롤
     */
    scrollTo(position: number, duration?: number): void;
    /**
     * 스크롤 콜백 추가
     */
    on(callback: ScrollCallback): void;
    /**
     * 스크롤 콜백 제거
     */
    off(callback: ScrollCallback): void;
    /**
     * 스크롤 비활성화
     */
    disable(): void;
    /**
     * 스크롤 활성화
     */
    enable(): void;
    /**
     * 옵션 업데이트
     */
    updateOptions(newOptions: Partial<TwoDimensionScrollOptions>): void;
    /**
     * 현재 스크롤 위치 가져오기
     */
    getCurrentPosition(): number;
    /**
     * 최대 스크롤 위치 가져오기
     */
    getMaxPosition(): number;
    /**
     * 라이브러리 해제
     */
    destroy(): void;
    /**
     * 디버그 로그
     */
    private log;
}
export default TwoDimensionScroll;
export * from "./types";
export * from "./utils";
//# sourceMappingURL=index.d.ts.map