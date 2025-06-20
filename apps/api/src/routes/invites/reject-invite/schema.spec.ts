import { rejectInviteSchema } from "./schema";

describe("rejectInviteSchema", () => {
  it("should have correct schema structure", () => {
    // Assert
    expect(rejectInviteSchema).toHaveProperty("tags");
    expect(rejectInviteSchema).toHaveProperty("summary");
    expect(rejectInviteSchema).toHaveProperty("security");
    expect(rejectInviteSchema).toHaveProperty("params");
    expect(rejectInviteSchema).toHaveProperty("response");
  });

  it("should have correct tags", () => {
    // Assert
    expect(rejectInviteSchema.tags).toEqual(["invites"]);
    expect(Array.isArray(rejectInviteSchema.tags)).toBe(true);
    expect(rejectInviteSchema.tags.length).toBe(1);
  });

  it("should have correct summary", () => {
    // Assert
    expect(rejectInviteSchema.summary).toBe("Reject an invite");
    expect(typeof rejectInviteSchema.summary).toBe("string");
  });

  it("should require bearer authentication", () => {
    // Assert
    expect(rejectInviteSchema.security).toEqual([{ bearerAuth: [] }]);
    expect(Array.isArray(rejectInviteSchema.security)).toBe(true);
    expect(rejectInviteSchema.security[0]).toHaveProperty("bearerAuth");
    expect(rejectInviteSchema.security[0]?.bearerAuth).toEqual([]);
  });

  it("should validate inviteId parameter as UUID", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;

    // Act & Assert - Valid UUID
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    expect(() => paramsSchema.parse({ inviteId: validUuid })).not.toThrow();

    const result = paramsSchema.parse({ inviteId: validUuid });
    expect(result.inviteId).toBe(validUuid);
  });

  it("should reject invalid UUID formats", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;

    // Act & Assert - Invalid UUIDs
    const invalidUuids = [
      "invalid-uuid",
      "123",
      "",
      "123e4567-e89b-12d3-a456", // Too short
      "123e4567-e89b-12d3-a456-426614174000-extra", // Too long
      "ggge4567-e89b-12d3-a456-426614174000", // Invalid characters
    ];

    invalidUuids.forEach((invalidUuid) => {
      expect(() => paramsSchema.parse({ inviteId: invalidUuid })).toThrow();
    });
  });

  it("should require inviteId parameter", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;

    // Act & Assert
    expect(() => paramsSchema.parse({})).toThrow();
    expect(() => paramsSchema.parse({ inviteId: undefined })).toThrow();
    expect(() => paramsSchema.parse({ inviteId: null })).toThrow();
  });

  it("should define 204 response as null", () => {
    // Assert
    expect(rejectInviteSchema.response).toHaveProperty("204");
    const responseSchema = rejectInviteSchema.response[204];
    expect(responseSchema._def.typeName).toBe("ZodNull");
  });

  it("should validate response schema for 204", () => {
    // Arrange
    const responseSchema = rejectInviteSchema.response[204];

    // Act & Assert
    expect(() => responseSchema.parse(null)).not.toThrow();
    expect(() => responseSchema.parse(undefined)).toThrow();
    expect(() => responseSchema.parse("")).toThrow();
    expect(() => responseSchema.parse({})).toThrow();
    expect(() => responseSchema.parse([])).toThrow();
  });

  it("should have only one response status code defined", () => {
    // Assert
    const responseKeys = Object.keys(rejectInviteSchema.response);
    expect(responseKeys).toEqual(["204"]);
    expect(responseKeys.length).toBe(1);
  });

  it("should handle different valid UUID formats", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;

    const validUuids = [
      "123e4567-e89b-12d3-a456-426614174000",
      "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
      "00000000-0000-0000-0000-000000000000",
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    ];

    // Act & Assert
    validUuids.forEach((validUuid) => {
      expect(() => paramsSchema.parse({ inviteId: validUuid })).not.toThrow();
      const result = paramsSchema.parse({ inviteId: validUuid });
      expect(result.inviteId).toBe(validUuid);
    });
  });

  it("should handle edge cases for params", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;

    // Act & Assert - Number instead of string
    expect(() => paramsSchema.parse({ inviteId: 123 })).toThrow();

    // Boolean instead of string
    expect(() => paramsSchema.parse({ inviteId: true })).toThrow();

    // Array instead of string
    expect(() => paramsSchema.parse({ inviteId: [] })).toThrow();

    // Object instead of string
    expect(() => paramsSchema.parse({ inviteId: {} })).toThrow();
  });

  it("should not accept extra parameters", () => {
    // Arrange
    const paramsSchema = rejectInviteSchema.params;
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    // Act & Assert
    const result = paramsSchema.parse({
      inviteId: validUuid,
      extraParam: "should be stripped",
    });

    expect(result).toEqual({ inviteId: validUuid });
    expect(result).not.toHaveProperty("extraParam");
  });
});
