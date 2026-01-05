/**
 * Auth Service Tests
 * Unit tests for authentication service functions
 */

import { isValidPhone } from '../authService';

describe('authService', () => {
  describe('isValidPhone', () => {
    it('should return true for valid Chinese phone numbers', () => {
      // Valid phones starting with 13x-19x
      expect(isValidPhone('13800138000')).toBe(true);
      expect(isValidPhone('14700147000')).toBe(true);
      expect(isValidPhone('15600156000')).toBe(true);
      expect(isValidPhone('16600166000')).toBe(true);
      expect(isValidPhone('17700177000')).toBe(true);
      expect(isValidPhone('18800188000')).toBe(true);
      expect(isValidPhone('19900199000')).toBe(true);
    });

    it('should return false for phone numbers with invalid prefix', () => {
      // Invalid: 10x, 11x, 12x are not valid mobile prefixes
      expect(isValidPhone('10800108000')).toBe(false);
      expect(isValidPhone('11800118000')).toBe(false);
      expect(isValidPhone('12800128000')).toBe(false);
    });

    it('should return false for phone numbers with wrong length', () => {
      // Too short (10 digits)
      expect(isValidPhone('1380013800')).toBe(false);
      // Too long (12 digits)
      expect(isValidPhone('138001380001')).toBe(false);
    });

    it('should return false for non-numeric input', () => {
      expect(isValidPhone('1380013800a')).toBe(false);
      expect(isValidPhone('abcdefghijk')).toBe(false);
      expect(isValidPhone('138-0013-800')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('should return false for phone numbers not starting with 1', () => {
      expect(isValidPhone('23800138000')).toBe(false);
      expect(isValidPhone('03800138000')).toBe(false);
    });
  });
});

describe('authService token parsing', () => {
  // Note: These tests require mocking expo-secure-store
  // For now, we test the pure utility functions

  describe('JWT payload parsing', () => {
    it('should correctly parse a valid JWT payload', () => {
      // This is a mock JWT with payload: {"sub": "user-123", "exp": 9999999999}
      const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImV4cCI6OTk5OTk5OTk5OX0.signature';

      // Extract and parse payload
      const parts = mockJwt.split('.');
      expect(parts.length).toBe(3);

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      expect(payload.sub).toBe('user-123');
    });
  });
});
