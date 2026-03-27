# Terra Odyssey

Terra Odyssey is a browser-based 3D voxel world prototype built with Vite and Three.js. It focuses on the core foundations of a sandbox exploration game: procedural terrain, chunk streaming, first-person movement, lightweight persistence, debug tooling, and an in-game topographic world map.

The project is still in prototype stage, but the main exploration loop is already playable: load into a seeded world, move through it in first person, stream chunks around the camera, inspect performance, switch biome generation modes, and view a live map of the currently loaded terrain.

## What The Project Does

- Generates a deterministic seeded voxel world
- Streams chunk-sized terrain around the player
- Renders blocks with Three.js instanced meshes
- Supports first-person movement with walking, sprinting, jumping, gravity, and stepping
- Saves player position and rotation to `localStorage`
- Includes a debug overlay with FPS, render stats, current biome, and biome-mode controls
- Includes a topographic world map with biome-aware coloring
- Provides an inspector/free-fly mode for debugging the scene

## Current Feature Set

Implemented today:

- Procedural terrain with smooth biome transitions
- Four surface biomes: plains, desert, hills, mountains
- Shared terrain generator used by chunk building, player grounding, and the map
- Chunk mesh generation separated from terrain sampling
- World base height / waterline tuned around `64`
- Larger vertical terrain scale with hills up to `150` and mountains up to `200`
- Debug overlay biome readout plus biome selection dropdown
- Natural mixed-world mode and forced single-biome test modes
- Static sky, sun, cloud presentation, and world lighting
- Player state save/load

Still early or incomplete:

- No trees, structures, rivers, caves, or interactive block gameplay yet
- No combat, crafting, inventory, or broader game loop systems yet
- No automated tests or lint scripts yet
- Some modules are still prototype-oriented and need more tuning/docs

## Tech Stack

- [Vite](https://vitejs.dev/) for development and production bundling
- [Three.js](https://threejs.org/) for rendering and scene management
- [stats.js](https://github.com/mrdoob/stats.js/) for performance monitoring
- Browser `localStorage` for active save data
- `better-sqlite3` exists in the repository, but it is not part of the current browser gameplay path

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Controls

### Exploration

- `Click` the canvas to lock the mouse pointer
- `W`, `A`, `S`, `D` to move
- `Shift` to sprint
- `Space` to jump

### Tools

- `M` to toggle the world map
- `Mouse wheel`, `+`, `-` to zoom the map
- `F2` to toggle the debug overlay
- `Alt + I` to toggle inspector mode

### Inspector Mode

When inspector mode is active, the regular grounded controller is disabled and the camera can move freely:

- `W`, `A`, `S`, `D` to move horizontally
- `Q` / `E` to move vertically

## Debug Overlay

The debug overlay is one of the most useful parts of the prototype right now. It shows:

- FPS
- draw calls
- triangle count
- memory stats
- camera position
- current chunk
- current biome under the player
- loaded chunk count
- inspector state

It also includes a biome-mode dropdown:

- `Random Natural World`
  Uses the normal mixed-biome terrain pipeline.
- `Plains`, `Desert`, `Hills`, `Mountains`
  Forces the whole generated world to that biome, which is useful for tuning terrain shapes and materials.

## Project Structure

```text
src/
  app/          Application bootstrap
  config/       Rendering, player, world, and generation tuning values
  database/     Experimental SQLite files and scripts
  engine/       Renderer, scene setup, game loop, debug tools
  gameplay/     Map overlay and gameplay-facing UI modules
  player/       Player state and movement controller
  systems/      Update-driven runtime systems
  world/        Blocks, chunks, meshing, and terrain generation
public/         Static assets
dist/           Production build output
```

## Runtime Overview

The application entry point is `src/main.js`, which boots the game and starts the loop. From there, the runtime is divided into a few clear responsibilities:

- `src/app/bootstrap.js`
  Creates the camera, scene, renderer, sky, terrain generator, chunk manager, map, controller, and debug overlay.
- `src/engine/loop/gameLoop.js`
  Runs the per-frame update/render cycle.
- `src/systems/systemManager.js`
  Updates registered systems every frame.
- `src/systems/chunkStreamingSystem.js`
  Watches player movement and asks the chunk manager to load/unload nearby chunks.
- `src/world/chunk/chunkManager.js`
  Tracks loaded chunks and rebuilds them when the biome mode changes.
- `src/world/chunk/chunk.js`
  Thin chunk wrapper that requests generated data and stores map-facing surface metadata.
- `src/world/chunk/chunkMeshBuilder.js`
  Converts generated column data into instanced block meshes.
- `src/player/controller/playerController.js`
  Handles grounded movement, jumping, stepping, and camera rotation.
- `src/gameplay/map/map.js`
  Draws the world map from loaded chunk surface data.

## Terrain Generation Architecture

The terrain system is now split into clearer modules so generation stays maintainable as the world gets more complex:

- `src/world/generation/biome.js`
  Defines biome IDs, labels, colors, elevation bands, and surface rules.
- `src/world/generation/terrainMath.js`
  Shared clamp / interpolation helpers used across worldgen.
- `src/world/generation/terrainSampling.js`
  Samples climate fields and terrain shape signals from seeded noise.
- `src/world/generation/terrainElevation.js`
  Resolves biome weights and computes final heights from biome profiles.
- `src/world/generation/terrainGenerator.js`
  Main terrain API used by chunks, player grounding, and debug/map systems.
- `src/world/chunk/chunkData.js`
  Typed-array-backed storage for generated per-column chunk data.

This separation matters because the world is no longer "just one height function." Biome choice, climate sampling, elevation shaping, surface material rules, and chunk meshing are all distinct responsibilities now.

## World Generation Notes

Current world generation highlights:

- World seed: `420`
- Chunk size: `16 x 16`
- World height: `256`
- Base height / waterline target: `64`
- Render distance: `16` chunks
- Biomes: plains, desert, hills, mountains
- Biomes transition smoothly by blending climate-driven weights rather than using hard borders
- Natural mode uses mixed biomes; debug mode can force a single biome across the world
- Terrain is stored as per-column chunk data and meshed afterward for efficiency

### Current Biome Height Bands

- Plains: roughly `64` to `92`
- Desert: roughly `64` to `104`
- Hills: roughly `64` to `150`
- Mountains: roughly `120` to `200`

These are design targets from the biome profiles, not strict "every column hits both extremes" guarantees. Actual terrain still depends on noise, climate weights, and local shaping.

## Rendering Notes

Some notable rendering choices in the current prototype:

- Blocks are rendered with instanced meshes to reduce draw overhead
- The chunk mesher uses typed-array-backed terrain data
- Textures are generated procedurally in code for grass, dirt, stone, and sand
- The scene uses ACES filmic tone mapping and sRGB output color space
- The sky is a stylized static setup with a directional sun and cloud clusters
- The world map is generated from chunk surface metadata rather than a separate minimap camera
- Vendor/debug/map code is split into separate build chunks to keep the main app bundle cleaner

## Persistence

The active save path is browser-side:

- Player position and rotation are written to `localStorage`
- Save operations run on an interval and flush when the game stops

There is also an experimental SQLite folder in `src/database`, but it is not currently wired into the browser runtime.

## Known Limitations

- No trees, foliage, structures, or water bodies yet
- No block interaction, mining, building, or voxel editing yet
- Terrain still needs visual tuning and feature passes to feel fully natural
- No caves or underground generation yet
- No automated tests or linting pipeline yet
- The project is optimized for iteration and experimentation, not final-game completeness

## Good Next Steps

Strong next directions for the project would be:

1. Add water, rivers, and erosion-style shaping
2. Add biome features such as trees, rocks, cacti, and grass clutter
3. Expand the surface system with more blocks and materials
4. Add structures and chunk-safe feature placement rules
5. Add caves and underground generation as a separate system
6. Add tests for terrain generation, chunk meshing, and chunk streaming
7. Keep tuning biome weights and elevation profiles based on visual playtesting

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build in `dist/`
- `npm run preview` previews the built app locally

## Why This Repo Is Useful

Terra Odyssey is a strong base project if you want to study or extend:

- chunked voxel terrain rendering
- Three.js world streaming patterns
- procedural biome generation in the browser
- debug-first prototyping workflows
- topographic map rendering from gameplay data

It is still small enough to understand without a huge codebase, but it now has enough structure to grow into a much richer sandbox world.
