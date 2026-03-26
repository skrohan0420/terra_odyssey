# Terra Odyssey

Terra Odyssey is a browser-based 3D voxel world prototype built with Vite and Three.js. It focuses on the core foundations of a sandbox exploration game: procedural terrain, chunk streaming, first-person movement, lightweight persistence, debug tooling, and an in-game topographic world map.

The project is currently at prototype stage, but the main gameplay loop already works: load into a generated world, move through it in first person, stream terrain around the camera, inspect performance, and open a live map of the loaded chunks.

## What This Project Does

- Generates terrain from a deterministic seeded noise function
- Builds the world in chunk-sized sections around the player
- Renders blocks using Three.js instanced meshes for efficiency
- Supports first-person exploration with mouse look, walking, sprinting, and jumping
- Persists player position and rotation in `localStorage`
- Includes a debug overlay for FPS and render stats
- Includes a world map overlay with zoom and terrain shading
- Provides an inspector/free-fly mode for debugging the scene

## Tech Stack

- [Vite](https://vitejs.dev/) for local development and bundling
- [Three.js](https://threejs.org/) for rendering and scene management
- [stats.js](https://github.com/mrdoob/stats.js/) for performance monitoring
- `better-sqlite3` is present in the repository, but the current runtime path uses browser `localStorage` for saves

## Current Status

This repository is best thought of as a strong engine/gameplay prototype rather than a finished game. The playable path works and the project builds successfully, but several planned systems are still placeholders.

Implemented today:

- Procedural terrain generation
- Chunk loading and unloading around the player
- Block materials and simple terrain layering
- Camera + renderer bootstrap
- Player controller with gravity, jumping, and stepping
- Static sky, sun, and cloud presentation
- Debug overlay and inspector mode
- Topographic world map
- Player state save/load

Still incomplete or stubbed:

- Biomes
- Terrain generator abstraction
- Chunk mesh builder abstraction
- Player physics module split-out
- Input/time/world state systems
- Full gameplay loop beyond exploration
- Documentation for deployment, testing, and contribution workflows

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

## Project Structure

```text
src/
  app/          Application bootstrap
  config/       Rendering, player, and world tuning values
  database/     Experimental SQLite files and scripts
  engine/       Renderer, scene setup, game loop, debug tools
  gameplay/     Map overlay and gameplay-facing UI modules
  player/       Player state and movement controller
  systems/      Update-driven runtime systems
  world/        Blocks, chunks, and terrain generation
public/         Static assets
dist/           Production build output
```

## How The Runtime Fits Together

The application entry point is `src/main.js`, which boots the game and starts the loop. From there, the project is divided into a few clear responsibilities:

- `app/bootstrap.js`
  Creates the camera, scene, renderer, sky, world systems, debug overlay, map, and controller.
- `engine/loop/gameLoop.js`
  Runs the per-frame update/render cycle.
- `systems/systemManager.js`
  Updates registered systems every frame.
- `systems/chunkStreamingSystem.js`
  Checks the player position and asks the chunk manager to stream terrain in or out.
- `world/chunk/chunkManager.js`
  Tracks loaded chunks and updates visible chunk sets around the player.
- `world/chunk/chunk.js`
  Generates a chunk mesh and stores surface metadata used by the map.
- `world/generation/noise.js`
  Produces deterministic terrain heights from the world seed.
- `player/controller/playerController.js`
  Handles movement, camera rotation, gravity, stepping, and jumping.
- `gameplay/map/map.js`
  Draws the topographic world map from currently loaded chunk data.

## World Generation Notes

The current terrain model is intentionally simple and readable:

- World seed: `420`
- Chunk size: `16 x 16`
- Render distance: `16` chunks
- Terrain is sampled from a seeded noise function with multiple octaves
- Terrain columns are layered with grass on top and dirt underneath
- Stone can be revealed through chunk metadata helpers

The result is a lightweight sandbox terrain suitable for experimenting with rendering, controls, map systems, and world streaming.

## Rendering Notes

Some notable rendering choices in the current prototype:

- Blocks are rendered with instanced meshes to reduce draw overhead
- Textures are generated procedurally in code for grass, dirt, and stone
- The scene uses ACES filmic tone mapping and sRGB output color space
- The sky is a stylized static setup with a directional sun and cloud clusters
- The world map is generated from per-chunk surface height data rather than a separate minimap camera

## Persistence

The active save path is browser-side:

- Player position and rotation are written to `localStorage`
- Save operations run on an interval and flush when the game stops

There is also an experimental SQLite folder in `src/database`, but it is not currently wired into the browser game loop.

## Known Limitations

- No tests or lint scripts are configured yet
- The README was added after the core prototype work, so some modules still lack inline documentation
- Several planned systems exist only as empty placeholder files
- The production bundle currently triggers a chunk-size warning during build
- Terrain interaction is minimal and gameplay systems are still early

## Development Priorities

Good next steps for the project would be:

1. Replace placeholder modules with real world/gameplay systems
2. Separate terrain generation from chunk mesh construction more cleanly
3. Add proper collision and block interaction systems
4. Expand terrain variety with biomes, materials, and structures
5. Add tests for world generation and chunk management
6. Introduce code splitting and optimization for the build output
7. Decide whether persistence should remain in `localStorage` or move to a real backend/save format

## Available Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build in `dist/`
- `npm run preview` previews the built app locally

## Why This Repo Is Useful

Terra Odyssey is a good base project if you want to study or extend:

- chunked voxel terrain rendering
- Three.js world streaming patterns
- browser-based first-person exploration controls
- debug-first prototyping workflows
- topographic map rendering from gameplay data

It is small enough to understand in one sitting, but structured enough to grow into a more complete sandbox or survival-style game.
