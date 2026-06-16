// Mock Supabase client globally
const supabaseMock = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  select: jest.fn().mockReturnThis(),
}

