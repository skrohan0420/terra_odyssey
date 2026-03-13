const STORAGE_KEY = "terra_player_state";

export function savePlayerState(camera) {
  const state = {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadPlayerState() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return null;

  return JSON.parse(data);
}