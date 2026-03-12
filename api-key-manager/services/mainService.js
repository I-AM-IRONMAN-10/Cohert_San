const { readData, writeData } = require("../utils/fileStorage");
const idGen = require("../utils/idGenerator");
const cryptoService = require("./cryptoService");

const FILE = "data/data.json";
const EXPIRY_DAYS = 30;

/** Returns true if the key is past its expiry date */
function isExpired(item) {
  return item.expiresAt && Date.now() > new Date(item.expiresAt).getTime();
}

/**
 * Create a new encrypted API key entry.
 */
exports.create = function (data, userId) {
  const list = readData(FILE);

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  // cryptoService.encrypt will throw if secret is empty/invalid
  const encryptedSecret = cryptoService.encrypt(data.secret);

  const item = {
    id: idGen(list),
    userId,
    title: data.title,
    secret: encryptedSecret,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    rotatedAt: null,
  };

  list.push(item);
  writeData(FILE, list);

  // Never return the encrypted secret to the caller
  const { secret, ...safeItem } = item;
  return safeItem;
};

/**
 * List all keys for a user, excluding the encrypted secret field.
 * Expired keys are included (so the UI can show the badge) but marked.
 */
exports.list = function (userId) {
  const list = readData(FILE);
  return list
    .filter((i) => i.userId === userId)
    .map(({ secret, ...safeItem }) => ({
      ...safeItem,
      expired: isExpired(safeItem),
    }));
};

/**
 * Delete a key by id. Returns false if not found or not owned by this user.
 */
exports.remove = function (id, userId) {
  const list = readData(FILE);
  const item = list.find((i) => i.id === id && i.userId === userId);
  if (!item) return false;
  const newList = list.filter((i) => !(i.id === id && i.userId === userId));
  writeData(FILE, newList);
  return true;
};

/**
 * Re-encrypt the secret with a fresh IV (key rotation).
 * Returns null if not found; throws if decrypt fails.
 */
exports.rotate = function (id, userId) {
  const list = readData(FILE);
  const idx = list.findIndex((i) => i.id === id && i.userId === userId);
  if (idx === -1) return null;

  // decrypt() and encrypt() both throw descriptive errors on failure —
  // let the controller catch and return a 500
  const plaintext = cryptoService.decrypt(list[idx].secret);
  list[idx].secret = cryptoService.encrypt(plaintext);
  list[idx].rotatedAt = new Date().toISOString();
  writeData(FILE, list);

  const { secret, ...safeItem } = list[idx];
  return safeItem;
};

/**
 * Reveal the plaintext secret for a key.
 * Returns null if not found; throws an error if the key is expired or decrypt fails.
 */
exports.reveal = function (id, userId) {
  const list = readData(FILE);
  const item = list.find((i) => i.id === id && i.userId === userId);
  if (!item) return null;

  // Block reveal of expired keys
  if (isExpired(item)) {
    throw new Error("This key has expired and cannot be revealed");
  }

  return cryptoService.decrypt(item.secret);
};