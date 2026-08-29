export function validateRooms(data) {
  if (!Array.isArray(data)) throw new Error("Room catalog must be an array.");
  const ids = new Set(), colors = new Set();
  return data.map(room => {
    if (!room?.id || !room?.name || !room?.color) throw new Error("Every room needs id, name, and color.");
    if (ids.has(room.id)) throw new Error(`Duplicate room id: ${room.id}`);
    const color = room.color.toLowerCase();
    if (colors.has(color)) throw new Error(`Duplicate room color: ${room.color}`);
    ids.add(room.id); colors.add(color);
    const {maxStack: legacyMaxStack, ...source} = room;
    const result = {...source, width: room.width ?? 1, height: room.height ?? 1, maxConstructionTier: room.maxConstructionTier ?? legacyMaxStack ?? 1, joinGroup: room.joinGroup ?? null};
    if (!Number.isInteger(result.width) || !Number.isInteger(result.height) || result.width < 1 || result.height < 1) {
      throw new Error(`${room.id}: width and height must be positive integers.`);
    }
    if (!Number.isInteger(result.maxConstructionTier) || result.maxConstructionTier < 1 || result.maxConstructionTier > 3) {
      throw new Error(`${room.id}: maxConstructionTier must be an integer from 1-3.`);
    }
    return result;
  });
}

export async function loadRooms(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load room catalog (${response.status}).`);
  return validateRooms(await response.json());
}

export async function loadRoomsFromFile(file) {
  return validateRooms(JSON.parse(await file.text()));
}

export function getRoomById(catalog, id) {
  return catalog.find(room => room.id === id) ?? null;
}

export function canRoomsJoin(a, b) {
  return Boolean(a?.joinGroup && b?.joinGroup && a.joinGroup === b.joinGroup);
}
