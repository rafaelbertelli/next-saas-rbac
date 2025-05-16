import { Role } from "@/generated/prisma";
import { defineAbilityFor, userSchema } from "@repo/auth";
import { getUserPermissions } from "./get-user-permissions";

jest.mock("@repo/auth", () => ({
  defineAbilityFor: jest.fn(),
  userSchema: { parse: jest.fn() },
}));

describe("getUserPermissions", () => {
  const userId = "user-1";
  const role = Role.ADMIN;
  const authUser = { id: userId, role };
  const can = () => true;
  const cannot = () => false;
  const abilityMock = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(userSchema.parse).mockReturnValue(authUser);
    jest.mocked(defineAbilityFor).mockReturnValue(abilityMock);
  });

  it("should parse user and return can/cannot from defineAbilityFor", () => {
    const result = getUserPermissions(userId, role);
    expect(userSchema.parse).toHaveBeenCalledWith({ id: userId, role });
    expect(defineAbilityFor).toHaveBeenCalledWith(authUser);
    expect(result).toEqual(abilityMock);
  });

  it("should work with different roles", () => {
    const anotherRole = Role.MEMBER;
    const anotherAuthUser = { id: userId, role: anotherRole };
    jest.mocked(userSchema.parse).mockReturnValueOnce(anotherAuthUser);
    jest.mocked(defineAbilityFor).mockReturnValueOnce(abilityMock);

    const result = getUserPermissions(userId, anotherRole);
    expect(userSchema.parse).toHaveBeenCalledWith({
      id: userId,
      role: anotherRole,
    });
    expect(defineAbilityFor).toHaveBeenCalledWith(anotherAuthUser);
    expect(result).toEqual(abilityMock);
  });
});
