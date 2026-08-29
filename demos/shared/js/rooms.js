function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateProgression(values, message) {
  assert(Array.isArray(values) && values.length > 0, message);
  for (const value of values) assert(Number.isInteger(value), message);
  return values;
}

function constructionTierProgression(room) {
  const progression = room?.rules?.construction?.progression;
  validateProgression(progression, `${room.identity.id}: construction progression must be a non-empty integer array.`);
  return progression;
}

function runtimeStaffing(definition) {
  const staffing = definition.rules.staffing;
  if (!staffing?.supportsStaffing) return {staffed: false, staffingProgression: undefined, staffingPerPhysicalRoom: undefined, joinedStaffingCapacity: undefined};
  const progression = validateProgression(staffing.progression, `${definition.identity.id}: staffing progression must be a non-empty integer array when staffing is supported.`);
  const joinedCapacity = definition.rules.joining?.supportsJoining ? (definition.rules.joining.staffingByLayout ?? staffing.joinedCapacity ?? null) : (staffing.joinedCapacity ?? null);
  return {
    staffed: true,
    staffingProgression: staffing.supportsProgression ? progression : undefined,
    staffingPerPhysicalRoom: staffing.supportsProgression ? undefined : progression[0],
    joinedStaffingCapacity: joinedCapacity,
  };
}

function normalizeRoom(room) {
  assert(room && typeof room === "object", "Each room definition must be an object.");
  const {identity, form, rules} = room;
  assert(identity && typeof identity === "object", "Every room needs an identity block.");
  assert(form && typeof form === "object", `${identity?.id ?? "room"}: every room needs a form block.`);
  assert(rules && typeof rules === "object", `${identity?.id ?? "room"}: every room needs a rules block.`);

  const id = identity.id;
  assert(isNonEmptyString(id), "Every room needs identity.id.");
  assert(isNonEmptyString(identity.name), `${id}: every room needs identity.name.`);
  assert(isNonEmptyString(identity.category), `${id}: every room needs identity.category.`);
  assert(isNonEmptyString(form.color), `${id}: every room needs form.color.`);

  const footprint = form.footprint ?? {};
  const width = footprint.width ?? 1;
  const height = footprint.height ?? 1;
  assert(isPositiveInteger(width) && isPositiveInteger(height), `${id}: form.footprint width and height must be positive integers.`);

  const construction = rules.construction ?? {};
  const ctProgression = constructionTierProgression(room);
  const maxConstructionTier = ctProgression[ctProgression.length - 1];
  assert(maxConstructionTier >= 1 && maxConstructionTier <= 3, `${id}: maximum construction tier must be in the range 1-3.`);

  const joining = rules.joining ?? {};
  const supportsJoining = Boolean(joining.supportsJoining);
  const joinGroup = supportsJoining ? (joining.group ?? id) : null;
  if (supportsJoining) {
    assert(isNonEmptyString(joinGroup), `${id}: join-capable rooms need rules.joining.group.`);
  }

  const staffingState = runtimeStaffing(room);
  const unique = construction.constructionLimit === "unique";

  return {
    id,
    name: identity.name,
    category: identity.category,
    color: form.color,
    width,
    height,
    joinGroup,
    maxConstructionTier,
    supportsConstructionTierProgression: Boolean(construction.supportsProgression),
    constructionLimit: construction.constructionLimit ?? "limited",
    unique,
    distributed: Boolean(form.distributed),
    staffed: staffingState.staffed,
    staffingProgression: staffingState.staffingProgression,
    staffingPerPhysicalRoom: staffingState.staffingPerPhysicalRoom,
    joinedStaffingCapacity: staffingState.joinedStaffingCapacity,
    schema: room,
  };
}

export function validateRooms(data) {
  assert(Array.isArray(data), "Room catalog must be an array.");
  const ids = new Set(), colors = new Set();
  return data.map(room => {
    const normalized = normalizeRoom(room);
    if (ids.has(normalized.id)) throw new Error(`Duplicate room id: ${normalized.id}`);
    const color = normalized.color.toLowerCase();
    if (colors.has(color)) throw new Error(`Duplicate room color: ${normalized.color}`);
    ids.add(normalized.id);
    colors.add(color);
    return normalized;
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