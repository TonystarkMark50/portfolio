jest.mock('../src/lib/supabase', () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: undefined as unknown,
  }
  chain.then = function (resolve: (v: { data: unknown; error: unknown }) => unknown) {
    return resolve({ data: [], error: null })
  }

  return {
    supabase: {
      from: jest.fn(() => ({ ...chain, then: undefined as unknown })),
    },
    submitContactForm: jest.fn(),
    getResumeDownloadCount: jest.fn(),
  }
})

import { getSingle, getAll, upsert, remove } from '../src/services/helpers'
import { supabase } from '../src/lib/supabase'

const mockFrom = supabase.from as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

function makeChain(result: { data: unknown; error: unknown }) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: function (resolve: (v: { data: unknown; error: unknown }) => unknown) {
      return resolve(result)
    },
  }
  return chain
}

describe('getSingle', () => {
  it('calls supabase with correct table', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await getSingle('profiles')
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.limit).toHaveBeenCalledWith(1)
    expect(chain.maybeSingle).toHaveBeenCalled()
  })

  it('returns data on success', async () => {
    const mockData = { id: '1', name: 'Test' }
    mockFrom.mockReturnValue(makeChain({ data: mockData, error: null }))

    const result = await getSingle('profiles')
    expect(result.data).toEqual(mockData)
    expect(result.error).toBeNull()
  })

  it('returns error on failure', async () => {
    const mockError = { message: 'Not found', code: 'PGRST116' }
    mockFrom.mockReturnValue(makeChain({ data: null, error: mockError }))

    const result = await getSingle('profiles')
    expect(result.data).toBeNull()
    expect(result.error).toEqual(mockError)
  })
})

describe('getAll', () => {
  it('calls supabase without order', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await getAll('projects')
    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(chain.select).toHaveBeenCalledWith('*')
  })

  it('applies order when specified', async () => {
    const chain = makeChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    await getAll('projects', 'display_order')
    expect(chain.order).toHaveBeenCalledWith('display_order', { ascending: true })
  })

  it('returns array of data', async () => {
    const mockData = [{ id: '1' }, { id: '2' }]
    mockFrom.mockReturnValue(makeChain({ data: mockData, error: null }))

    const result = await getAll('projects')
    expect(result.data).toEqual(mockData)
  })
})

describe('upsert', () => {
  it('calls supabase with record', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    const record = { id: '1', name: 'Updated' }
    await upsert('profiles', record)
    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(chain.upsert).toHaveBeenCalledWith(record)
  })
})

describe('remove', () => {
  it('calls supabase delete with id', async () => {
    const chain = makeChain({ data: null, error: null })
    mockFrom.mockReturnValue(chain)

    await remove('projects', '123')
    expect(mockFrom).toHaveBeenCalledWith('projects')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', '123')
  })

  it('returns no error on success', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }))

    const result = await remove('projects', '123')
    expect(result.error).toBeNull()
  })
})
