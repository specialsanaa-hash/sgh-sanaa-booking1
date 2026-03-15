import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiKeyService from '../apiKeyService';
import * as db from '../../db';

// Mock database
vi.mock('../../db', () => ({
  getDb: vi.fn(),
}));

describe('API Key Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiKey', () => {
    it('should create a new API key', async () => {
      const mockInsert = vi.fn().mockResolvedValue({});
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.createApiKey(1, 'Test Key', 'Test Description');

      expect(result.name).toBe('Test Key');
      expect(result.description).toBe('Test Description');
      expect(result.isActive).toBe(true);
      expect(result.key).toMatch(/^sk_/);
      expect(result.secret).toBeDefined();
    });

    it('should throw error if database connection fails', async () => {
      vi.spyOn(db, 'getDb').mockResolvedValue(null);

      await expect(apiKeyService.createApiKey(1, 'Test Key')).rejects.toThrow();
    });
  });

  describe('getUserApiKeys', () => {
    it('should return user API keys', async () => {
      const mockKeys = [
        {
          id: 1,
          name: 'Key 1',
          key: 'sk_1234567890abcdefghij',
          description: 'Test',
          isActive: 1,
          lastUsedAt: new Date(),
          createdAt: new Date(),
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(mockKeys),
          }),
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.getUserApiKeys(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Key 1');
      expect(result[0].key).toBe('sk_1234567...');
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should validate active API key', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ isActive: 1 }]),
            }),
          }),
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.validateApiKey('sk_test');

      expect(result).toBe(true);
    });

    it('should reject inactive API key', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ isActive: 0 }]),
            }),
          }),
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.validateApiKey('sk_test');

      expect(result).toBe(false);
    });

    it('should return false for non-existent key', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.validateApiKey('sk_invalid');

      expect(result).toBe(false);
    });
  });

  describe('toggleApiKey', () => {
    it('should toggle API key status', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      });

      const mockDb = {
        update: mockUpdate,
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.toggleApiKey(1, false);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteApiKey', () => {
    it('should delete API key', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      });

      const mockDb = {
        delete: mockDelete,
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.deleteApiKey(1);

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('regenerateApiKey', () => {
    it('should regenerate API key', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      });

      const mockDb = {
        update: mockUpdate,
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await apiKeyService.regenerateApiKey(1);

      expect(result.id).toBe(1);
      expect(result.key).toMatch(/^sk_/);
      expect(result.secret).toBeDefined();
    });
  });
});
