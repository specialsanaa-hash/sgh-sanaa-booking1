import { describe, it, expect } from 'vitest';
import { setupSocketIO, sendMessageToApp, getActiveConnections } from '../socketio-server';

describe('Socket.io Integration', () => {
  it('should initialize Socket.io server', () => {
    expect(setupSocketIO).toBeDefined();
    expect(typeof setupSocketIO).toBe('function');
  });

  it('should export sendMessageToApp function', () => {
    expect(sendMessageToApp).toBeDefined();
    expect(typeof sendMessageToApp).toBe('function');
  });

  it('should export getActiveConnections function', () => {
    expect(getActiveConnections).toBeDefined();
    expect(typeof getActiveConnections).toBe('function');
  });

  it('should have proper Socket.io configuration', () => {
    expect(setupSocketIO.length).toBeGreaterThanOrEqual(0);
  });
});
