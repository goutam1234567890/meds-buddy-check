import { describe, it, expect, vi } from 'vitest';
import { login } from '../api/auth';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('login', () => {
  it('should return user and token on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'abc', user: { id: 1, username: 'test', role: 'patient' } })
    });
    const result = await login('test', 'password');
    expect(result.token).toBe('abc');
    expect(result.user.username).toBe('test');
  });

  it('should throw error on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    });
    await expect(login('bad', 'bad')).rejects.toThrow('Invalid credentials');
  });
});
