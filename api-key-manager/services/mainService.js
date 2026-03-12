const { readData, writeData } = require("../utils/fileStorage");
const idGen = require("../utils/idGenerator");
const cryptoService = require("./cryptoService");

const FILE = "data/data.json";
const EXPIRY_DAYS = 30;

exports.create = function (data, userId) {
  const list = readData(FILE);

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  const item = {
    id: idGen(list),
    userId,
    title: data.title,
    secret: cryptoService.encrypt(data.secret),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    rotatedAt: null,
  };

  list.push(item);
  writeData(FILE, list);

  // Return without secret
  const { secret, ...safeItem } = item;
  return safeItem;
};

exports.list = function (userId) {
  const list = readData(FILE);
  return list
    .filter((i) => i.userId === userId)
    .map(({ secret, ...safeItem }) => safeItem); // never expose encrypted value
};

exports.remove = function (id, userId) {
  const list = readData(FILE);
  const item = list.find((i) => i.id === id && i.userId === userId);
  if (!item) return false;
  const newList = list.filter((i) => !(i.id === id && i.userId === userId));
  writeData(FILE, newList);
  return true;
};

exports.rotate = function (id, userId) {
  const list = readData(FILE);
  const idx = list.findIndex((i) => i.id === id && i.userId === userId);
  if (idx === -1) return null;

  // Decrypt current secret, re-encrypt with a fresh IV
  const plaintext = cryptoService.decrypt(list[idx].secret);
  list[idx].secret = cryptoService.encrypt(plaintext);
  list[idx].rotatedAt = new Date().toISOString();
  writeData(FILE, list);

  const { secret, ...safeItem } = list[idx];
  return safeItem;
};

exports.reveal = function (id, userId) {
  const list = readData(FILE);
  const item = list.find((i) => i.id === id && i.userId === userId);
  if (!item) return null;
  return cryptoService.decrypt(item.secret);
};