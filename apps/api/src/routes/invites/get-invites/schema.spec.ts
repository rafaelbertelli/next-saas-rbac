import { getInvitesSchema } from "./schema";

describe("getInvitesSchema", () => {
  describe("Schema Structure", () => {
    it("should have correct tags", () => {
      // Assert
      expect(getInvitesSchema.tags).toEqual(["organizations", "invites"]);
    });

    it("should have correct summary", () => {
      // Assert
      expect(getInvitesSchema.summary).toBe("Get organization invites");
    });

    it("should have bearer auth security", () => {
      // Assert
      expect(getInvitesSchema.security).toEqual([{ bearerAuth: [] }]);
    });

    it("should have params and response schemas", () => {
      // Assert
      expect(getInvitesSchema.params).toBeDefined();
      expect(getInvitesSchema.response).toBeDefined();
      expect(getInvitesSchema.response[200]).toBeDefined();
    });
  });

  describe("Params Validation", () => {
    it("should validate valid slug parameter", () => {
      // Arrange
      const validParams = { slug: "valid-org-slug" };

      // Act
      const result = getInvitesSchema.params.safeParse(validParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validParams);
      }
    });

    it("should validate slug with numbers and dashes", () => {
      // Arrange
      const validParams = { slug: "org-123-test" };

      // Act
      const result = getInvitesSchema.params.safeParse(validParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("org-123-test");
      }
    });

    it("should validate slug with underscores", () => {
      // Arrange
      const validParams = { slug: "org_with_underscores" };

      // Act
      const result = getInvitesSchema.params.safeParse(validParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("org_with_underscores");
      }
    });

    it("should reject missing slug parameter", () => {
      // Arrange
      const invalidParams = {};

      // Act
      const result = getInvitesSchema.params.safeParse(invalidParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0]?.path).toEqual(["slug"]);
        expect(result.error.issues[0]?.code).toBe("invalid_type");
      }
    });

    it("should reject non-string slug parameter", () => {
      // Arrange
      const invalidParams = { slug: 123 };

      // Act
      const result = getInvitesSchema.params.safeParse(invalidParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
      }
    });

    it("should reject null slug parameter", () => {
      // Arrange
      const invalidParams = { slug: null };

      // Act
      const result = getInvitesSchema.params.safeParse(invalidParams);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
      }
    });
  });

  describe("Response Validation", () => {
    it("should validate successful response with invites", () => {
      // Arrange
      const validResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "John Doe",
                email: "john@example.com",
                avatarUrl: "https://example.com/avatar.jpg",
              },
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe("Invites retrieved successfully");
        expect(result.data.data.invites).toHaveLength(1);
      }
    });

    it("should validate response with empty invites array", () => {
      // Arrange
      const validResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites).toHaveLength(0);
      }
    });

    it("should validate response with multiple invites", () => {
      // Arrange
      const validResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "member@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Admin User",
                email: "admin@example.com",
                avatarUrl: null,
              },
            },
            {
              id: "550e8400-e29b-41d4-a716-446655440002",
              email: "admin@example.com",
              role: "ADMIN",
              status: "ACCEPTED",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(validResponse);

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
          message: "Invites retrieved successfully",
          data: {
            invites: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "user@example.com",
                role,
                status: "PENDING",
                createdAt: new Date(),
                updatedAt: new Date(),
                inviter: null,
              },
            ],
          },
        };

        // Act
        const result = getInvitesSchema.response[200].safeParse(validResponse);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    it("should validate all valid statuses", () => {
      // Arrange
      const statuses = ["PENDING", "ACCEPTED", "REJECTED"];

      statuses.forEach((status) => {
        const validResponse = {
          message: "Invites retrieved successfully",
          data: {
            invites: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: "user@example.com",
                role: "MEMBER",
                status,
                createdAt: new Date(),
                updatedAt: new Date(),
                inviter: null,
              },
            ],
          },
        };

        // Act
        const result = getInvitesSchema.response[200].safeParse(validResponse);

        // Assert
        expect(result.success).toBe(true);
      });
    });

    it("should reject response with invalid invite id format", () => {
      // Arrange
      const invalidResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "invalid-uuid",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_string");
      }
    });

    it("should reject response with invalid email format", () => {
      // Arrange
      const invalidResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "invalid-email",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_string");
      }
    });

    it("should reject response with invalid role", () => {
      // Arrange
      const invalidResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "INVALID_ROLE",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_enum_value");
      }
    });

    it("should reject response with invalid status", () => {
      // Arrange
      const invalidResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "INVALID_STATUS",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_enum_value");
      }
    });

    it("should reject response missing required fields", () => {
      // Arrange
      const invalidResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              // Missing role, status, createdAt, updatedAt
              inviter: null,
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(invalidResponse);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        const missingFields = result.error.issues.map(
          (issue) => issue.path[issue.path.length - 1]
        );
        expect(missingFields).toContain("role");
        expect(missingFields).toContain("status");
      }
    });

    it("should validate inviter with all fields", () => {
      // Arrange
      const validResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "John Doe",
                email: "john@example.com",
                avatarUrl: "https://example.com/avatar.jpg",
              },
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites[0]?.inviter).not.toBeNull();
        expect(result.data.data.invites[0]?.inviter?.name).toBe("John Doe");
      }
    });

    it("should validate inviter with null name and avatarUrl", () => {
      // Arrange
      const validResponse = {
        message: "Invites retrieved successfully",
        data: {
          invites: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              email: "user@example.com",
              role: "MEMBER",
              status: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
              inviter: {
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: null,
                email: "john@example.com",
                avatarUrl: null,
              },
            },
          ],
        },
      };

      // Act
      const result = getInvitesSchema.response[200].safeParse(validResponse);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.invites[0]?.inviter?.name).toBeNull();
        expect(result.data.data.invites[0]?.inviter?.avatarUrl).toBeNull();
      }
    });
  });
});
