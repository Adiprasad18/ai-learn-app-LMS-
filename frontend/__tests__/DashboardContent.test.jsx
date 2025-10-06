import React from "react"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import DashboardContent from "@/app/dashboard/_components/DashboardContent"

const mockToastError = jest.fn()

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    toast: {
      error: mockToastError,
      success: jest.fn(),
    },
  }),
}))

describe("DashboardContent", () => {
  const mockUser = { id: "user_123", isMember: true }

  const defaultResponse = {
    success: true,
    data: {
      stats: {
        totalCourses: 4,
        completedCourses: 2,
        overallProgress: 65,
        completedChapters: 12,
        totalChapters: 20,
        finalAssessments: {
          finalTestsAvailable: 3,
          finalTestsAttempted: 2,
          finalTestsPassed: 1,
          finalTestAttempts: 3,
          finalTestPassRate: 33,
          finalTestBestPercentage: 85,
          finalTestPassedAttempts: 1,
        },
      },
      courses: [
        {
          courseId: "course_1",
          courseTitle: "Mastering React",
          courseTopic: "React",
          courseStatus: "ready",
          studyType: "project",
          difficultyLevel: "intermediate",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-02-01T00:00:00.000Z",
          totalChapters: "12",
          completedChapters: 6,
          progressPercentage: "50",
          lastAccessedAt: "2024-02-05T00:00:00.000Z",
        },
      ],
    },
  }

  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => defaultResponse,
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
    mockToastError.mockReset()
  })

  it("renders statistics and courses after fetching data", async () => {
    render(<DashboardContent user={mockUser} />)

    expect(screen.getByText(/total courses/i)).toBeInTheDocument()
    expect(screen.getByText(/completed courses/i)).toBeInTheDocument()
    expect(screen.getByText(/overall progress/i)).toBeInTheDocument()
    expect(screen.getByText(/final test pass rate/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("4")).toBeInTheDocument()
      expect(screen.getByText("2")).toBeInTheDocument()
      expect(screen.getByText("65%"))
      expect(screen.getByText("33%"))
      expect(screen.getByText(/best attempt: 85%/i)).toBeInTheDocument()
      expect(screen.getByText(/1 passed \/ 2 attempted/i)).toBeInTheDocument()
      expect(screen.getByText(/total attempts: 3/i)).toBeInTheDocument()
      expect(screen.getByText(/passed attempts: 1/i)).toBeInTheDocument()
    })

    const courseCard = screen.getByRole("link", { name: /mastering react/i })
    const withinCard = within(courseCard)
    expect(withinCard.getByText("Mastering React")).toBeInTheDocument()
    expect(withinCard.getByText(/~/)).toBeInTheDocument()
  })

  it("shows free plan upgrade banner when user is not a member", async () => {
    render(<DashboardContent user={{ ...mockUser, isMember: false }} />)

    await waitFor(() => {
      expect(screen.getByText(/upgrade to ai learn pro/i)).toBeInTheDocument()
    })
  })

  it("handles empty courses gracefully", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          stats: {
            totalCourses: 0,
            completedCourses: 0,
            overallProgress: 0,
            completedChapters: 0,
            totalChapters: 0,
            finalAssessments: null,
          },
          courses: [],
        },
      }),
    })

    render(<DashboardContent user={mockUser} />)

    await waitFor(() => {
      expect(screen.getByText(/no courses yet/i)).toBeInTheDocument()
      expect(screen.getByText(/create your first course/i)).toBeInTheDocument()
    })
  })

  it("shows error toast when fetch fails", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: "Failed" }),
    })

    render(<DashboardContent user={mockUser} />)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Failed to load dashboard",
        "Please refresh the page to try again"
      )
    })
  })
})