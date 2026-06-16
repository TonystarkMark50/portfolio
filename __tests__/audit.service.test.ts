jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ error: null }),
  },
  submitContactForm: jest.fn(),
  getResumeDownloadCount: jest.fn(),
}))

import { logAuditAction } from '../src/services/audit.service'
import { supabase } from '../src/lib/supabase'

const mockSupabase = supabase as unknown as {
  auth: { getUser: jest.Mock }
  from: jest.Mock
  insert: jest.Mock
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSupabase.from.mockReturnThis()
  mockSupabase.insert.mockResolvedValue({ error: null })
})

describe('logAuditAction', () => {
  it('inserts audit log with provided email', async () => {
    await logAuditAction('login', 'admin@test.com')
    expect(mockSupabase.from).toHaveBeenCalledWith('admin_audit_log')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      action: 'login',
      email: 'admin@test.com',
      role: 'admin',
    })
  })

  it('fetches user email when not provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'user@test.com' } },
    })

    await logAuditAction('logout')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      action: 'logout',
      email: 'user@test.com',
      role: 'admin',
    })
  })

  it('uses unknown when no user email available', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    })

    await logAuditAction('test_action')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      action: 'test_action',
      email: 'unknown',
      role: 'admin',
    })
  })

  it('does not throw on insert failure', async () => {
    mockSupabase.insert.mockResolvedValue({ error: { message: 'DB error' } })

    await expect(logAuditAction('test', 'a@b.com')).resolves.toBeUndefined()
  })

  it('does not throw on getUser failure', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

    await expect(logAuditAction('test')).resolves.toBeUndefined()
  })
})
