const mockDbMethods = {
  findFirst: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
};

export const prisma = {
  organization: mockDbMethods,
  user: mockDbMethods,
  membership: mockDbMethods,
  organizationMember: mockDbMethods,
  member: mockDbMethods,
  project: mockDbMethods,
};
