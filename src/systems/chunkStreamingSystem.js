export class ChunkStreamingSystem {
  constructor(chunkManager, getPlayerPosition, shouldPause = () => false) {
    this.chunkManager = chunkManager;
    this.getPlayerPosition = getPlayerPosition;
    this.shouldPause = shouldPause;
    this.chunkChanged = false;
  }

  update() {
    if (this.shouldPause()) {
      return;
    }

    const didChange = this.chunkManager.update(this.getPlayerPosition());
    this.chunkChanged = this.chunkChanged || didChange;
  }

  consumeChunkChange() {
    const didChange = this.chunkChanged;
    this.chunkChanged = false;
    return didChange;
  }

  markChunkChanged() {
    this.chunkChanged = true;
  }
}
