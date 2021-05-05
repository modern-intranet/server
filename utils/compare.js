function compare(a, b) {
  return a.trim().localeCompare(b.trim(), "en", { sensitivity: "base" }) === 0;
}

module.exports = compare;
