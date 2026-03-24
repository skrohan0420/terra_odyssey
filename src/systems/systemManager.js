export class SystemManager {
  constructor() {
    this.systems = [];
  }

  register(system) {
    if (!system?.update) {
      return system;
    }

    this.systems.push(system);
    return system;
  }

  update(delta) {
    for (const system of this.systems) {
      system.update(delta);
    }
  }
}
