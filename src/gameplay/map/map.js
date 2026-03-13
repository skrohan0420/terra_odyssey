import { CHUNK_SIZE } from "../../config/config";

export class WorldMap {

    constructor(getChunks, getPlayerPosition) {

        this.canvas = document.getElementById("worldMap");
        this.ctx = this.canvas.getContext("2d");

        this.getChunks = getChunks;
        this.getPlayerPosition = getPlayerPosition;

        this.visible = false;

        this.scale = 10;

        this.lastPlayerChunk = { x: null, z: null };

        this.resize();

        window.addEventListener("resize", () => this.resize());

        window.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "m") {
                this.toggle();
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    toggle() {

        this.visible = !this.visible;

        this.canvas.style.display = this.visible ? "block" : "none";

        if (this.visible) {
            this.render();
        }
    }

    render() {

        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const chunks = this.getChunks() || [];
        const player = this.getPlayerPosition();

        if (!player) return;

        const playerChunkX = Math.floor(player.x / CHUNK_SIZE);
        const playerChunkZ = Math.floor(player.z / CHUNK_SIZE);

        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;

        for (const mesh of chunks) {

            const data = mesh.userData;
            if (!data) continue;

            const cx = data.chunkX;
            const cz = data.chunkZ;

            const screenX =
                (cx - playerChunkX) * this.scale + centerX;

            const screenZ =
                (cz - playerChunkZ) * this.scale + centerZ;

            const avgHeight = this.getAverageHeight(data.columnHeights);

            ctx.fillStyle = this.getHeightColor(avgHeight);

            ctx.fillRect(
                screenX,
                screenZ,
                this.scale,
                this.scale
            );

            ctx.strokeStyle = "#1b3a2f";
            ctx.strokeRect(
                screenX,
                screenZ,
                this.scale,
                this.scale
            );
        }

        this.drawPlayer();
    }

    getAverageHeight(heights) {

        let total = 0;
        let count = 0;

        for (const key in heights) {
            total += heights[key];
            count++;
        }

        return total / count;
    }

    getHeightColor(height) {

        if (height < 8) return "#1f5f2e";     // low land
        if (height < 12) return "#3aa657";    // grass
        if (height < 18) return "#8b6f47";    // dirt
        return "#d8d8d8";                     // mountain
    }

    drawPlayer() {

        const ctx = this.ctx;

        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;

        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.arc(centerX, centerZ, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}