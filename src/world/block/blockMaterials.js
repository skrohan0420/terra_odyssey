import { BLOCK_DEFINITIONS } from "./blockDefinitions";
import { createLambertMaterial } from "./textureUtils";

function createFaceMaterials(textures) {
  const sideTexture = textures.side?.() ?? textures.all?.();
  const topTexture = textures.top?.() ?? textures.all?.();
  const bottomTexture = textures.bottom?.() ?? textures.all?.();

  const sideMaterial = createLambertMaterial(sideTexture);
  const topMaterial = createLambertMaterial(topTexture);
  const bottomMaterial = createLambertMaterial(bottomTexture);

  return [
    sideMaterial,
    sideMaterial,
    topMaterial,
    bottomMaterial,
    sideMaterial,
    sideMaterial
  ];
}

function buildBlockMaterials(definitions) {
  return Object.fromEntries(
    Object.entries(definitions).map(([blockId, definition]) => {
      return [blockId, createFaceMaterials(definition.textures)];
    })
  );
}

export const blockMaterialsById = buildBlockMaterials(BLOCK_DEFINITIONS);
