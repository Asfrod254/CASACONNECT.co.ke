const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const validateRequired = (payload = {}, fields = []) => {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  return missing;
};

module.exports = {
  isValidEmail,
  validateRequired,
};
