import { getPendingInvitesSchema } from "./schema";

describe("getPendingInvitesSchema", () => {
  describe("Schema Structure", () => {
    it("should have correct tags", () => {
      // Assert
      expect(getPendingInvitesSchema.tags).toEqual(["invites"]);
    });

    it("should have correct summary", () => {
      // Assert
      expect(getPendingInvitesSchema.summary).toBe(
        "Get pending invites for current user"
      );
    });

    it("should have bearer auth security", () => {
      // Assert
      expect(getPendingInvitesSchema.security).toEqual([{ bearerAuth: [] }]);
    });

    it("should have response schema defined", () => {
      // Assert
      expect(getPendingInvitesSchema.response).toBeDefined();
      expect(getPendingInvitesSchema.response[200]).toBeDefined();
    });

    it("should not have params schema", () => {
      // Assert
      expect((getPendingInvitesSchema as any).params).toBeUndefined();
    });
  });

  describe("Response Validation", () => {
    it("should validate successful response with pending invites", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Test Organization",
                slug: "test-org",
                avatarUrl: "https://example.com/avatar.jpg",
              },
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                name: "John Doe",
                email: "john@example.com",
              },
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe(
          "Pending invites retrieved successfully"
        );
        expect(result.data.data.invites).toHaveLength(1);
      }
    });

    it("should validate response with empty invites array", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites).toHaveLength(0);
      }
    });

    it("should validate response with multiple invites", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "member@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Organization 1",
                slug: "org-1",
                avatarUrl: null,
              },
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                name: "Admin User",
                email: "admin@example.com",
              },
            },
            {
              id: "550e8400-e29b-41d4-a716-446655440003",
              email: "admin@example.com",
              role: "ADMIN",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440004",
                name: "Organization 2",
                slug: "org-2",
                avatarUrl: "https://example.com/org2.jpg",
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites).toHaveLength(2);
        expect(result.data.data.invites[0]?.role).toBe("MEMBER");
        expect(result.data.data.invites[1]?.role).toBe("ADMIN");
      }
    });

    it("should validate all valid roles", () => {
      // Arrange
      const roles = ["MEMBER", "ADMIN", "BILLING"];

      roles.forEach((role) => {
        const validResponse = {
          message: "Pending invites retrieved successfully",
          data: {
            invites: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "user@example.com",
                role,
                status: "PENDING",
                createdAt: new Date(),
                updatedAt: new Date(),
                organization: {
                  id: "550e8400-e29b-41d4-a716-446655440001",
                  name: "Test Org",
                  slug: "test-org",
                  avatarUrl: null,
                },
                inviter: null,
              },
            ],
          },
        };

        // Act
        const result =
          getPendingInvitesSchema.response[200].safeParse(validResponse);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    it("should validate all valid statuses", () => {
      // Arrange
      const statuses = ["PENDING", "ACCEPTED", "REJECTED"];

      statuses.forEach((status) => {
        const validResponse = {
          message: "Pending invites retrieved successfully",
          data: {
            invites: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "user@example.com",
                role: "MEMBER",
                status,
                createdAt: new Date(),
                updatedAt: new Date(),
                organization: {
                  id: "550e8400-e29b-41d4-a716-446655440001",
                  name: "Test Org",
                  slug: "test-org",
                  avatarUrl: null,
                },
                inviter: null,
              },
            ],
          },
        };

        // Act
        const result =
          getPendingInvitesSchema.response[200].safeParse(validResponse);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    it("should reject response with invalid invite id format", () => {
      // Arrange
      const invalidResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "invalid-uuid",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Test Org",
                slug: "test-org",
                avatarUrl: null,
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_string");
      }
    });

    it("should reject response with invalid email format", () => {
      // Arrange
      const invalidResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "invalid-email",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Test Org",
                slug: "test-org",
                avatarUrl: null,
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_string");
      }
    });

    it("should reject response with invalid role", () => {
      // Arrange
      const invalidResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "INVALID_ROLE",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Test Org",
                slug: "test-org",
                avatarUrl: null,
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_enum_value");
      }
    });

    it("should reject response with invalid status", () => {
      // Arrange
      const invalidResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "INVALID_STATUS",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Test Org",
                slug: "test-org",
                avatarUrl: null,
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_enum_value");
      }
    });

    it("should validate organization with all fields", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Complete Organization",
                slug: "complete-org",
                avatarUrl: "https://example.com/complete.jpg",
              },
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                name: "Complete User",
                email: "complete@example.com",
              },
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites[0]?.organization.avatarUrl).toBe(
          "https://example.com/complete.jpg"
        );
        expect(result.data.data.invites[0]?.inviter?.name).toBe(
          "Complete User"
        );
      }
    });

    it("should validate organization and inviter with null values", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Null Avatar Org",
                slug: "null-avatar-org",
                avatarUrl: null,
              },
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440002",
                name: null,
                email: "null-name@example.com",
              },
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites[0]?.organization.avatarUrl).toBeNull();
        expect(result.data.data.invites[0]?.inviter?.name).toBeNull();
      }
    });

    it("should validate inviter as null", () => {
      // Arrange
      const validResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              organization: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "No Inviter Org",
                slug: "no-inviter-org",
                avatarUrl: null,
              },
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites[0]?.inviter).toBeNull();
      }
    });

    it("should reject response missing required fields", () => {
      // Arrange
      const invalidResponse = {
        message: "Pending invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              // Missing role, status, createdAt, updatedAt, organization
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result =
        getPendingInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        const missingFields = result.error.issues.map(
          (issue) => issue.path[issue.path.length - 1]
        );
        expect(missingFields).toContain("role");
        expect(missingFields).toContain("status");
        expect(missingFields).toContain("organization");
      }
    });
  });
});
