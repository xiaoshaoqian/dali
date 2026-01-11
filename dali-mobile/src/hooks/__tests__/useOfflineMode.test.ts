/**
 * useOfflineMode Hook Tests
 *
 * @see Story 8.2: Offline Mode Handler with Graceful Degradation
 * @see AC#1: Network State Detection
 * @see AC#9: API Request Offline Fallback
 */
import { renderHook, act } from '@testing-library/react-native';
import { useOfflineMode, categorizeNetworkError, OfflineError } from '../useOfflineMode';
import { useOfflineStore } from '@/stores';

// Mock the store
jest.mock('@/stores', () => ({
  useOfflineStore: jest.fn(),
}));

const mockUseOfflineStore = useOfflineStore as jest.MockedFunction<typeof useOfflineStore>;

describe('useOfflineMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isOffline state', () => {
    it('should return isOffline true when network is disconnected', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.isOffline).toBe(true);
    });

    it('should return isOffline false when network is connected', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.isOffline).toBe(false);
    });
  });

  describe('network transition detection', () => {
    it('should detect transition from online to offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.justWentOffline).toBe(true);
    });

    it('should detect transition from offline to online', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: false,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.justWentOnline).toBe(true);
    });
  });

  describe('showBanner state', () => {
    it('should show banner when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.showBanner).toBe(true);
    });

    it('should not show banner when online', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.showBanner).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should allow local actions when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.canPerformAction('browse_history')).toBe(true);
      expect(result.current.canPerformAction('like')).toBe(true);
      expect(result.current.canPerformAction('save')).toBe(true);
      expect(result.current.canPerformAction('save_to_album')).toBe(true);
    });

    it('should block network actions when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.canPerformAction('generate_outfit')).toBe(false);
      expect(result.current.canPerformAction('share_social')).toBe(false);
    });

    it('should allow all actions when online', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.canPerformAction('generate_outfit')).toBe(true);
      expect(result.current.canPerformAction('share_social')).toBe(true);
    });
  });

  describe('getRestrictionMessage', () => {
    it('should return null for allowed actions when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.getRestrictionMessage('browse_history')).toBeNull();
      expect(result.current.getRestrictionMessage('like')).toBeNull();
      expect(result.current.getRestrictionMessage('save')).toBeNull();
    });

    it('should return null for all actions when online', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: true,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.getRestrictionMessage('generate_outfit')).toBeNull();
      expect(result.current.getRestrictionMessage('share_social')).toBeNull();
    });

    it('should return message for generate_outfit when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.getRestrictionMessage('generate_outfit')).toBe(
        '无法生成新搭配，你可以查看历史搭配或等待网络恢复'
      );
    });

    it('should return message for share_social when offline', () => {
      mockUseOfflineStore.mockReturnValue({
        isOnline: false,
        wasOnline: true,
      } as ReturnType<typeof useOfflineStore>);

      const { result } = renderHook(() => useOfflineMode());

      expect(result.current.getRestrictionMessage('share_social')).toBe(
        '当前离线，分享功能暂不可用'
      );
    });
  });
});

describe('categorizeNetworkError', () => {
  it('should categorize network errors correctly', () => {
    const networkError = new Error('Network Error');
    const result = categorizeNetworkError(networkError);

    expect(result).toEqual({
      isOfflineError: true,
      userMessage: '当前离线，请检查网络连接',
      originalError: networkError,
    });
  });

  it('should categorize timeout errors correctly', () => {
    const timeoutError = new Error('timeout of 5000ms exceeded');
    const result = categorizeNetworkError(timeoutError);

    expect(result).toEqual({
      isOfflineError: true,
      userMessage: '网络连接超时，请稍后重试',
      originalError: timeoutError,
    });
  });

  it('should not categorize other errors as offline', () => {
    const serverError = new Error('Internal Server Error');
    const result = categorizeNetworkError(serverError);

    expect(result).toEqual({
      isOfflineError: false,
      userMessage: 'Internal Server Error',
      originalError: serverError,
    });
  });

  it('should handle AxiosError-like objects', () => {
    const axiosError = {
      message: 'Network Error',
      code: 'ERR_NETWORK',
    };
    const result = categorizeNetworkError(axiosError);

    expect(result.isOfflineError).toBe(true);
  });
});
