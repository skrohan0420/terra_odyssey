import { BLOCK_DEFINITIONS } from "./blockDefinitions";
import { blockMaterialsById } from "./blockMaterials";
import { BLOCK_RENDER_ORDER } from "./blockTypes";

export const BLOCK_REGISTRY = Object.freeze(
  Object.fromEntries(
    BLOCK_RENDER_ORDER.map((blockId) => {
      const definition = BLOCK_DEFINITIONS[blockId];

      return [
        blockId,
        Object.freeze({
          ...definition,
          materials: blockMaterialsById[blockId]
        })
      ];
    })
  )
);

export const RENDERABLE_BLOCKS = Object.freeze(
  BLOCK_RENDER_ORDER.map((blockId) => BLOCK_REGISTRY[blockId])
);

export function getBlockEntry(blockId) {
  return BLOCK_REGISTRY[blockId];
}
