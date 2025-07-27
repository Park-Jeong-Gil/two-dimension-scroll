/**
 * 모바일 디바이스 감지
 */
export declare function isMobile(): boolean;
/**
 * 터치 디바이스 감지
 */
export declare function isTouchDevice(): boolean;
/**
 * 값을 특정 범위로 제한
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * 선형 보간
 */
export declare function lerp(start: number, end: number, factor: number): number;
/**
 * 스크롤 가능한 최대 높이 계산
 */
export declare function getMaxScrollTop(): number;
/**
 * 현재 스크롤 위치 가져오기
 */
export declare function getCurrentScrollTop(): number;
/**
 * RAF 폴리필
 */
export declare const raf: ((callback: FrameRequestCallback) => number) & typeof requestAnimationFrame;
/**
 * cancelAnimationFrame 폴리필
 */
export declare const cancelRaf: ((handle: number) => void) & typeof cancelAnimationFrame;
/**
 * 패시브 이벤트 리스너 지원 확인
 */
export declare function supportsPassive(): boolean;
/**
 * 디바운스 함수
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * 쓰로틀 함수
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=utils.d.ts.map