import { getBillingInfoFromOrganizationService } from "@/services/billing/get-billing-info-from-organization";
import { getBillingInfoFromOrganizationRoute } from ".";

// Mock the service
jest.mock(
  "@/services/billing/get-billing-info-from-organization/get-billing-info-from-organization.service"
);

describe("getBillingInfoFromOrganizationRoute", () => {
  const mockBillingInfo = {
    billing: {
      seats: {
        amount: 2,
        unit: 10,
        price: 20,
      },
      projects: {
        amount: 3,
        unit: 20,
        price: 60,
      },
      total: {
        amount: 80,
        unit: "USD",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get billing information successfully", async () => {
    // Arrange
    (getBillingInfoFromOrganizationService as jest.Mock).mockResolvedValue(
      mockBillingInfo
    );

    const mockRequest = {
      params: { slug: "test-org" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getBillingInfoFromOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getBillingInfoFromOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Billing information retrieved successfully",
      data: mockBillingInfo,
    });
  });

  it("should handle service errors", async () => {
    // Arrange
    const serviceError = new Error("Service error");
    (getBillingInfoFromOrganizationService as jest.Mock).mockRejectedValue(
      serviceError
    );

    const mockRequest = {
      params: { slug: "test-org" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getBillingInfoFromOrganizationRoute(mockApp as any);

    // Act & Assert
    await expect(routeHandler(mockRequest, mockReply)).rejects.toThrow(
      "Service error"
    );
    expect(getBillingInfoFromOrganizationService).toHaveBeenCalledWith({
      userId: "user-123",
      organizationSlug: "test-org",
    });
  });

  it("should register the route with correct path and middleware", async () => {
    // Arrange
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Act
    await getBillingInfoFromOrganizationRoute(mockApp as any);

    // Assert
    expect(mockApp.withTypeProvider).toHaveBeenCalled();
    expect(mockApp.register).toHaveBeenCalled();
    expect(mockApp.get).toHaveBeenCalledWith(
      "/organizations/:slug/billing",
      expect.objectContaining({
        schema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should handle different organization slugs", async () => {
    // Arrange
    (getBillingInfoFromOrganizationService as jest.Mock).mockResolvedValue(
      mockBillingInfo
    );

    const mockRequest = {
      params: { slug: "another-org" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-456"),
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getBillingInfoFromOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(getBillingInfoFromOrganizationService).toHaveBeenCalledWith({
      userId: "user-456",
      organizationSlug: "another-org",
    });
  });

  it("should handle zero cost billing", async () => {
    // Arrange
    const zeroBillingInfo = {
      billing: {
        seats: {
          amount: 0,
          unit: 10,
          price: 0,
        },
        projects: {
          amount: 0,
          unit: 20,
          price: 0,
        },
        total: {
          amount: 0,
          unit: "USD",
        },
      },
    };

    (getBillingInfoFromOrganizationService as jest.Mock).mockResolvedValue(
      zeroBillingInfo
    );

    const mockRequest = {
      params: { slug: "empty-org" },
      getCurrentUserId: jest.fn().mockResolvedValue("user-123"),
    };
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    let routeHandler: any;
    const mockApp = {
      withTypeProvider: jest.fn().mockReturnThis(),
      register: jest.fn().mockReturnThis(),
      get: jest.fn((path, options, handler) => {
        routeHandler = handler;
      }),
    };

    await getBillingInfoFromOrganizationRoute(mockApp as any);

    // Act
    await routeHandler(mockRequest, mockReply);

    // Assert
    expect(mockReply.send).toHaveBeenCalledWith({
      message: "Billing information retrieved successfully",
      data: zeroBillingInfo,
    });
  });
});
