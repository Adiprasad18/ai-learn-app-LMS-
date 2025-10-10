import '@testing-library/jest-dom'

// Add Node.js polyfills for browser APIs
global.TextDecoder = require('util').TextDecoder
global.TextEncoder = require('util').TextEncoder
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map(Object.entries(init.headers || {}))
    this.body = init.body
  }
  
  async json() {
    return JSON.parse(this.body || '{}')
  }
}
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Map(Object.entries(init.headers || {}))
  }
  
  static json(data, init = {}) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers }
    })
  }
}

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key'
process.env.GOOGLE_AI_API_KEY = 'test-api-key'
process.env.DATABASE_URL = 'test-database-url'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-clerk-key'
process.env.CLERK_SECRET_KEY = 'test-clerk-secret'
process.env.INNGEST_EVENT_KEY = 'test-event-key'
process.env.INNGEST_SIGNING_KEY = 'test-signing-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({ userId: 'test-user-id' })),
  currentUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
}))

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    userId: 'test-user-id',
    isSignedIn: true,
  }),
  useUser: () => ({
    user: { id: 'test-user-id', emailAddresses: [{ emailAddress: 'test@example.com' }] },
    isLoaded: true,
  }),
  ClerkProvider: ({ children }) => children,
  SignInButton: ({ children }) => children,
  SignOutButton: ({ children }) => children,
}))

// Mock Inngest
jest.mock('@/backend/inngest/client', () => ({
  inngest: {
    send: jest.fn(() => Promise.resolve({ ids: ['test-event-id'] })),
  },
}))

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  title: "Test Course",
                  description: "Test course description",
                  chapters: [
                    {
                      title: "Chapter 1",
                      description: "Chapter 1 description",
                      content: "Chapter 1 content"
                    }
                  ]
                })
              }]
            }
          }]
        }
      })
    })
  }))
}))

// Mock database
jest.mock('@/backend/configs/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
  }
}))

// Mock course service
jest.mock('@/backend/server/course-service', () => ({
  getCourseById: jest.fn().mockResolvedValue({ id: 'test-course', userId: 'test-user-id' }),
  updateCourseStatus: jest.fn().mockResolvedValue(true),
  createChapter: jest.fn().mockResolvedValue({ id: 'test-chapter' }),
  createNote: jest.fn().mockResolvedValue({ id: 'test-note' }),
  createFlashcard: jest.fn().mockResolvedValue({ id: 'test-flashcard' }),
  createQuiz: jest.fn().mockResolvedValue({ id: 'test-quiz' }),
}))

// Mock telemetry service
jest.mock('@/backend/services/telemetry-service', () => ({
  TelemetryService: {
    getInstance: jest.fn().mockReturnValue({
      startOperation: jest.fn().mockReturnValue('test-operation-id'),
      endOperation: jest.fn(),
      recordError: jest.fn(),
      recordEvent: jest.fn(),
      incrementCounter: jest.fn(),
      recordTiming: jest.fn(),
    })
  }
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
