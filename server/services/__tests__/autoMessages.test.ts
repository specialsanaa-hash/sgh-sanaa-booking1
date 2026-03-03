import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendBookingConfirmedMessage,
  sendBookingCancelledMessage,
  sendBookingCompletedMessage,
  sendBookingReminderMessage,
  messageTemplates,
} from '../autoMessages';
import * as db from '../../db';

// Mock the database
vi.mock('../../db', () => ({
  getDb: vi.fn(),
}));

describe('Auto Messages Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendBookingConfirmedMessage', () => {
    it('should send booking confirmed message', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ insertId: 123 });
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await sendBookingConfirmedMessage(
        '+967123456789',
        'أحمد محمد',
        '2026-03-15',
        1,
        'SMS'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(123);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      vi.spyOn(db, 'getDb').mockResolvedValue(null);

      const result = await sendBookingConfirmedMessage(
        '+967123456789',
        'أحمد محمد',
        '2026-03-15',
        1,
        'SMS'
      );

      expect(result.success).toBe(false);
    });
  });

  describe('sendBookingCancelledMessage', () => {
    it('should send booking cancelled message', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ insertId: 124 });
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await sendBookingCancelledMessage(
        '+967123456789',
        'أحمد محمد',
        1,
        'SMS'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(124);
    });
  });

  describe('sendBookingCompletedMessage', () => {
    it('should send booking completed message', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ insertId: 125 });
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await sendBookingCompletedMessage(
        '+967123456789',
        'أحمد محمد',
        1,
        'SMS'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(125);
    });
  });

  describe('sendBookingReminderMessage', () => {
    it('should send booking reminder message', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ insertId: 126 });
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: mockInsert,
        }),
      };

      vi.spyOn(db, 'getDb').mockResolvedValue(mockDb as any);

      const result = await sendBookingReminderMessage(
        '+967123456789',
        'أحمد محمد',
        '2026-03-15',
        1,
        'SMS'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(126);
    });
  });

  describe('Message Templates', () => {
    it('should have booking confirmed template', () => {
      expect(messageTemplates.booking_confirmed).toBeDefined();
      expect(messageTemplates.booking_confirmed.ar).toContain('{patientName}');
      expect(messageTemplates.booking_confirmed.ar).toContain('{appointmentDate}');
      expect(messageTemplates.booking_confirmed.ar).toContain('{bookingId}');
    });

    it('should have booking cancelled template', () => {
      expect(messageTemplates.booking_cancelled).toBeDefined();
      expect(messageTemplates.booking_cancelled.ar).toContain('{patientName}');
      expect(messageTemplates.booking_cancelled.ar).toContain('{bookingId}');
    });

    it('should have booking completed template', () => {
      expect(messageTemplates.booking_completed).toBeDefined();
      expect(messageTemplates.booking_completed.ar).toContain('{patientName}');
      expect(messageTemplates.booking_completed.ar).toContain('{bookingId}');
    });

    it('should have booking reminder template', () => {
      expect(messageTemplates.booking_reminder).toBeDefined();
      expect(messageTemplates.booking_reminder.ar).toContain('{appointmentDate}');
      expect(messageTemplates.booking_reminder.ar).toContain('{bookingId}');
    });
  });
});
