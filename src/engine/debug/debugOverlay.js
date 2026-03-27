import Stats from "stats.js";
import { CHUNK_SIZE } from "../../config/worldConfig";

function createRow(labelText, valueNode) {
  const row = document.createElement("div");
  const label = document.createElement("span");

  label.textContent = `${labelText}: `;
  row.appendChild(label);
  row.appendChild(valueNode);

  return row;
}

function createValueNode(color = "white") {
  const value = document.createElement("span");
  value.style.color = color;
  return value;
}

export class DebugOverlay {
  constructor(
    renderer,
    camera,
    getChunkCount,
    getInspectorState,
    getBiomeLabel,
    getBiomeMode,
    getBiomeModeOptions,
    setBiomeMode
  ) {
    this.renderer = renderer;
    this.camera = camera;
    this.getChunkCount = getChunkCount;
    this.getInspectorState = getInspectorState;
    this.getBiomeLabel = getBiomeLabel;
    this.getBiomeMode = getBiomeMode;
    this.getBiomeModeOptions = getBiomeModeOptions;
    this.setBiomeMode = setBiomeMode;

    this.STORAGE_KEY = "debug_overlay_enabled";
    this.enabled = this.loadState();
    this.stats = new Stats();

    this.infoEl = document.createElement("div");
    this.infoEl.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(6px);
      color: #ffffff;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.6;
      letter-spacing: 0.5px;
      z-index: 1000;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      font-weight: bold;
      border-radius: 6px;
      user-select: none;
      min-width: 212px;
    `;
    document.body.appendChild(this.infoEl);

    this.values = {};
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();

    this.createRows();
    this.setupToggle();
    this.setVisibility(this.enabled);
  }

  createRows() {
    this.values.fps = createValueNode("#00ff88");
    this.values.drawCalls = createValueNode();
    this.values.triangles = createValueNode();
    this.values.geometries = createValueNode();
    this.values.textures = createValueNode();
    this.values.camera = createValueNode();
    this.values.chunk = createValueNode();
    this.values.biome = createValueNode("#f5e6ae");
    this.values.chunks = createValueNode();
    this.values.inspect = createValueNode("#ff1f1f");

    this.biomeModeSelect = document.createElement("select");
    this.biomeModeSelect.style.cssText = `
      margin-top: 3px;
      background: rgba(14, 22, 32, 0.92);
      color: #f3f7fb;
      border: 1px solid rgba(202, 223, 241, 0.24);
      border-radius: 4px;
      padding: 3px 6px;
      font: inherit;
      pointer-events: auto;
    `;
    this.populateBiomeModeOptions();
    this.biomeModeSelect.addEventListener("change", () => {
      this.setBiomeMode?.(this.biomeModeSelect.value);
    });

    this.infoEl.appendChild(createRow("FPS", this.values.fps));
    this.infoEl.appendChild(createRow("Draw Calls", this.values.drawCalls));
    this.infoEl.appendChild(createRow("Triangles", this.values.triangles));
    this.infoEl.appendChild(createRow("Geometries", this.values.geometries));
    this.infoEl.appendChild(createRow("Textures", this.values.textures));
    this.infoEl.appendChild(createRow("Camera", this.values.camera));
    this.infoEl.appendChild(createRow("Chunk", this.values.chunk));
    this.infoEl.appendChild(createRow("Biome", this.values.biome));
    this.infoEl.appendChild(createRow("Chunks", this.values.chunks));
    this.infoEl.appendChild(createRow("Inspect Mode", this.values.inspect));
    this.infoEl.appendChild(createRow("Biome Mode", this.biomeModeSelect));
  }

  populateBiomeModeOptions() {
    const currentMode = this.getBiomeMode?.() ?? "natural";
    this.biomeModeSelect.innerHTML = "";

    for (const option of this.getBiomeModeOptions?.() ?? []) {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      this.biomeModeSelect.appendChild(node);
    }

    this.biomeModeSelect.value = currentMode;
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved === null ? true : saved === "true";
    } catch {
      return true;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.enabled);
    } catch {
      // ignore storage errors
    }
  }

  setupToggle() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "F2") {
        this.enabled = !this.enabled;
        this.setVisibility(this.enabled);
        this.saveState();
      }
    });
  }

  setVisibility(state) {
    this.stats.dom.style.display = state ? "block" : "none";
    this.infoEl.style.display = state ? "flex" : "none";
  }

  updateFps() {
    this.frames++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 250) {
      this.fps = Math.round((this.frames * 1000) / delta);
      this.frames = 0;
      this.lastTime = now;
    }
  }

  syncBiomeModeSelect() {
    const currentMode = this.getBiomeMode?.() ?? "natural";

    if (this.biomeModeSelect.value !== currentMode) {
      this.biomeModeSelect.value = currentMode;
    }
  }

  updateInfo() {
    const r = this.renderer.info;
    const inspector = this.getInspectorState ? this.getInspectorState() : false;
    const chunkX = Math.floor(this.camera.position.x / CHUNK_SIZE);
    const chunkZ = Math.floor(this.camera.position.z / CHUNK_SIZE);

    let fpsColor = "#00ff88";
    if (this.fps < 50) fpsColor = "#ffff00";
    if (this.fps < 30) fpsColor = "#ff4444";

    this.values.fps.textContent = String(this.fps);
    this.values.fps.style.color = fpsColor;
    this.values.drawCalls.textContent = String(r.render.calls);
    this.values.triangles.textContent = r.render.triangles.toLocaleString();
    this.values.geometries.textContent = String(r.memory.geometries);
    this.values.textures.textContent = String(r.memory.textures);
    this.values.camera.textContent =
      `${this.camera.position.x.toFixed(1)}, ` +
      `${this.camera.position.y.toFixed(1)}, ` +
      `${this.camera.position.z.toFixed(1)}`;
    this.values.chunk.textContent = `(${chunkX},${chunkZ})`;
    this.values.biome.textContent = this.getBiomeLabel ? this.getBiomeLabel() : "Unknown";
    this.values.chunks.textContent = String(this.getChunkCount());
    this.values.inspect.textContent = inspector ? "ON" : "OFF";
    this.values.inspect.style.color = inspector ? "#35ff50" : "#ff1f1f";

    this.syncBiomeModeSelect();
  }

  begin() {
    if (!this.enabled) return;
    this.stats.begin();
  }

  end() {
    if (!this.enabled) return;
    this.stats.end();
  }

  update() {
    if (!this.enabled) return;

    this.updateFps();
    this.updateInfo();
  }
}
