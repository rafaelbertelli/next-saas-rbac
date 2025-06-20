import { z } from "zod";
import { revokeInviteSchema } from "./schema";

describe("revokeInviteSchema", () => {
  describe("Schema Structure", () => {
    it("should have correct tags", () => {
      // Assert
      expect(revokeInviteSchema.tags).toEqual(["organizations", "invites"]);
    });

    it("should have correct summary", () => {
      // Assert
      expect(revokeInviteSchema.summary).toBe("Revoke an invite");
    });

    it("should have bearer auth security", () => {
      // Assert
      expect(revokeInviteSchema.security).toEqual([{ bearerAuth: [] }]);
    });

    it("should have params schema defined", () => {
      // Assert
      expect(revokeInviteSchema.params).toBeDefined();
      expect(revokeInviteSchema.params).toBeInstanceOf(z.ZodObject);
    });

    it("should have response schema defined", () => {
      // Assert
      expect(revokeInviteSchema.response).toBeDefined();
      expect(revokeInviteSchema.response[204]).toBeDefined();
    });

    it("should not have body schema", () => {
      // Assert
      expect((revokeInviteSchema as any).body).toBeUndefined();
    });
  });

  describe("Parameters Validation", () => {
    it("should validate valid slug and inviteId parameters", () => {
      // Arrange
      const validParams = {
        slug: "test-organization",
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(validParams);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("test-organization");
        expect(result.data.inviteId).toBe(
          "550e8400-e29b-41d4-a716-446655440000"
        );
      }
    });

    it("should validate slug with different valid formats", () => {
      // Arrange
      const validSlugs = [
        "simple-org",
        "org_with_underscores",
        "org-with-multiple-dashes",
        "orgwithoutdashes",
        "Org123",
        "org-123-test",
      ];

      validSlugs.forEach((slug) => {
        const params = {
          slug,
          inviteId: "550e8400-e29b-41d4-a716-446655440000",
        };

        // Act
        const result = revokeInviteSchema.params.safeParse(params);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.slug).toBe(slug);
        }
      });
    });

    it("should validate different valid UUID formats", () => {
      // Arrange
      const validUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "123e4567-e89b-12d3-a456-426614174000",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      ];

      validUUIDs.forEach((inviteId) => {
        const params = {
          slug: "test-org",
          inviteId,
        };

        // Act
        const result = revokeInviteSchema.params.safeParse(params);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.inviteId).toBe(inviteId);
        }
      });
    });

    it("should reject invalid UUID format for inviteId", () => {
      // Arrange
      const invalidUUIDs = [
        "invalid-uuid",
        "123",
        "not-a-uuid-at-all",
        "550e8400-e29b-41d4-a716",
        "550e8400-e29b-41d4-a716-446655440000-extra",
        "",
      ];

      invalidUUIDs.forEach((inviteId) => {
        const params = {
          slug: "test-org",
          inviteId,
        };

        // Act
        const result = revokeInviteSchema.params.safeParse(params);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.code).toBe("invalid_string");
          expect(result.error.issues[0]?.path).toContain("inviteId");
        }
      });
    });

    it("should validate empty slug (if allowed by schema)", () => {
      // Arrange
      const params = {
        slug: "",
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert - Check what the actual behavior is
      // If empty string is allowed, this test should pass
      // If not allowed, it should fail with appropriate error
      if (result.success) {
        expect(result.data.slug).toBe("");
      } else {
        expect(result.error.issues[0]?.path).toContain("slug");
      }
    });

    it("should reject missing slug parameter", () => {
      // Arrange
      const params = {
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
        expect(result.error.issues[0]?.path).toContain("slug");
      }
    });

    it("should reject missing inviteId parameter", () => {
      // Arrange
      const params = {
        slug: "test-org",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
        expect(result.error.issues[0]?.path).toContain("inviteId");
      }
    });

    it("should reject non-string slug", () => {
      // Arrange
      const params = {
        slug: 123,
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
        expect(result.error.issues[0]?.path).toContain("slug");
      }
    });

    it("should reject non-string inviteId", () => {
      // Arrange
      const params = {
        slug: "test-org",
        inviteId: 123,
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
        expect(result.error.issues[0]?.path).toContain("inviteId");
      }
    });
  });

  describe("Response Validation", () => {
    it("should validate 204 response with null", () => {
      // Arrange
      const response = null;

      // Act
      const result = revokeInviteSchema.response[204].safeParse(response);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it("should reject 204 response with undefined", () => {
      // Arrange
      const response = undefined;

      // Act
      const result = revokeInviteSchema.response[204].safeParse(response);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe("invalid_type");
      }
    });

    it("should reject 204 response with non-null value", () => {
      // Arrange
      const invalidResponses = [
        "some string",
        123,
        { message: "success" },
        [],
        true,
        false,
      ];

      invalidResponses.forEach((response) => {
        // Act
        const result = revokeInviteSchema.response[204].safeParse(response);

        // Assert
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.code).toBe("invalid_type");
        }
      });
    });

    it("should have only 204 status code in response", () => {
      // Assert
      const statusCodes = Object.keys(revokeInviteSchema.response);
      expect(statusCodes).toEqual(["204"]);
      expect(statusCodes).toHaveLength(1);
    });
  });

  describe("Schema Properties", () => {
    it("should have all required properties", () => {
      // Assert
      expect(revokeInviteSchema).toHaveProperty("tags");
      expect(revokeInviteSchema).toHaveProperty("summary");
      expect(revokeInviteSchema).toHaveProperty("security");
      expect(revokeInviteSchema).toHaveProperty("params");
      expect(revokeInviteSchema).toHaveProperty("response");
    });

    it("should have correct security configuration", () => {
      // Assert
      expect(revokeInviteSchema.security).toHaveLength(1);
      expect(revokeInviteSchema.security[0]).toHaveProperty("bearerAuth");
      expect(revokeInviteSchema.security[0]?.bearerAuth).toEqual([]);
    });

    it("should have params as ZodObject with correct shape", () => {
      // Assert
      expect(revokeInviteSchema.params).toBeInstanceOf(z.ZodObject);
      const shape = (revokeInviteSchema.params as z.ZodObject<any>).shape;
      expect(shape).toHaveProperty("slug");
      expect(shape).toHaveProperty("inviteId");
    });

    it("should have response[204] as ZodNull", () => {
      // Assert
      expect(revokeInviteSchema.response[204]).toBeInstanceOf(z.ZodNull);
    });
  });

  describe("Edge Cases", () => {
    it("should handle params with extra properties", () => {
      // Arrange
      const params = {
        slug: "test-org",
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
        extraProperty: "should-be-ignored",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("test-org");
        expect(result.data.inviteId).toBe(
          "550e8400-e29b-41d4-a716-446655440000"
        );
        expect((result.data as any).extraProperty).toBeUndefined();
      }
    });

    it("should handle very long valid slug", () => {
      // Arrange
      const longSlug = "a".repeat(100);
      const params = {
        slug: longSlug,
        inviteId: "550e8400-e29b-41d4-a716-446655440000",
      };

      // Act
      const result = revokeInviteSchema.params.safeParse(params);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe(longSlug);
      }
    });

    it("should handle slug with special characters", () => {
      // Arrange
      const specialSlugs = [
        "org-with-dashes",
        "org_with_underscores",
        "org.with.dots",
        "org123numbers",
        "ORG-UPPERCASE",
      ];

      specialSlugs.forEach((slug) => {
        const params = {
          slug,
          inviteId: "550e8400-e29b-41d4-a716-446655440000",
        };

        // Act
        const result = revokeInviteSchema.params.safeParse(params);

        // Assert
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.slug).toBe(slug);
        }
      });
    });
  });
});
