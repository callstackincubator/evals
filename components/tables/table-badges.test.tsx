import { describe, expect, it } from "vitest";
import { getModelLogoDataUri } from "@/components/tables/table-badges";

function decodeSvgDataUri(dataUri: string): string {
  const encodedSvg = dataUri.replace(/^data:image\/svg\+xml;utf8,/, "");

  return decodeURIComponent(encodedSvg);
}

describe("getModelLogoDataUri", () => {
  it("uses provider logos for Mistral and MiMo models", () => {
    expect(decodeSvgDataUri(getModelLogoDataUri("mistral-large-3", "Mistral Large 3"))).toContain("#FFAF00");
    expect(decodeSvgDataUri(getModelLogoDataUri("mimo-v2.5-pro", "Mimo V2.5 Pro"))).toContain("mimo-logo-gradient");
  });
});
