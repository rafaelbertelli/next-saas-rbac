import { createSlug } from "./create-slug";

describe("createSlug", () => {
  it("should convert to lowercase and replace spaces with hyphens", () => {
    expect(createSlug("Hello World")).toBe("hello-world");
  });

  it("should remove accents/diacritics", () => {
    expect(createSlug("Café São João")).toBe("cafe-sao-joao");
  });

  it("should remove special characters", () => {
    expect(createSlug("Hello@World!")).toBe("helloworld");
  });

  it("should trim and replace multiple spaces with a single hyphen", () => {
    expect(createSlug("  Hello    World  ")).toBe("hello-world");
  });

  it("should replace multiple hyphens with a single hyphen", () => {
    expect(createSlug("Hello---World")).toBe("hello-world");
  });

  it("should handle empty string", () => {
    expect(createSlug("")).toBe("");
  });
});
