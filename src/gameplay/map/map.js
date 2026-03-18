import { CHUNK_SIZE } from "../../config/config";

export class WorldMap {

    constructor(getChunks, getPlayerPosition) {

        this.canvas = document.getElementById("worldMap");
        this.ctx = this.canvas.getContext("2d");

        this.getChunks = getChunks;
        this.getPlayerPosition = getPlayerPosition;

        this.visible = false;

        this.scale = 2; // smaller = fits more area
        this.renderRadius = 100; //  in BLOCKS

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

        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;

        for (const mesh of chunks) {

            const data = mesh.userData;
            if (!data || !data.columnHeights) continue;

            for (const key in data.columnHeights) {

                const height = data.columnHeights[key];

                const [worldX, worldZ] = key.split(",").map(Number);

                //  distance from player (BLOCK distance)
                const dx = worldX - player.x;
                const dz = worldZ - player.z;

                if (Math.abs(dx) > this.renderRadius ||
                    Math.abs(dz) > this.renderRadius) continue;

                const screenX =
                    centerX + dx * this.scale;

                const screenZ =
                    centerZ + dz * this.scale;

                ctx.fillStyle = this.getHeightColor(height);

                ctx.fillRect(
                    screenX,
                    screenZ,
                    this.scale,
                    this.scale
                );
            }
        }

        this.drawPlayer();
    }

    getHeightColor(height) {

        if (height < 6) return "#1b4d2b";
        if (height < 10) return "#2f7d3f";
        if (height < 14) return "#7a6a4f";
        if (height < 20) return "#a8a8a8";
        return "#ffffff";
    }

    drawPlayer() {

        const ctx = this.ctx;

        const centerX = this.canvas.width / 2;
        const centerZ = this.canvas.height / 2;

        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.arc(centerX, centerZ, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}