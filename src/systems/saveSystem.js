import { savePlayerState } from "../player/playerState";

export class SaveSystem {
  constructor(camera, intervalSeconds = 2) {
    this.camera = camera;
    this.intervalSeconds = intervalSeconds;
    this.elapsed = 0;
  }

  update(delta) {
    this.elapsed += delta;

    if (this.elapsed < this.intervalSeconds) {
      return;
    }

    savePlayerState(this.camera);
    this.elapsed = 0;
  }

  flush() {
    savePlayerState(this.camera);
    this.elapsed = 0;
  }
}
