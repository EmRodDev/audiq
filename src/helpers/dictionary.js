const fs = require("node:fs");
const path = require("node:path");

const dictionaryPath = path.join(__dirname, "..", "config", "dictionary.json");
const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, "utf8"));

// Get language from environment variable, with fallback to en_US
// Supports LANGUAGE env var first, then LANG, then defaults to en_US
// Also handles locale format like "en_US.UTF-8" by extracting just "en_US"
const getLanguage = () => {
  const language = process.env.LANGUAGE || process.env.LANG || "en_US";
  // Extract language code if it's in format like "en_US.UTF-8"
  return language.split(".")[0] || "en_US";
};

const LANG = getLanguage();

/**
 * Get a string from the dictionary
 * @param {string} key - Dot notation path to the string (e.g., "commands.suggest.description")
 * @param {object} replacements - Object with replacements for {{placeholder}} patterns
 * @returns {string} The localized string
 */
function getString(key, replacements = {}) {
  const keys = key.split(".");
  let value = dictionary[LANG];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Dictionary key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== "string") {
    console.warn(`Dictionary value is not a string: ${key}`);
    return key;
  }

  let result = value;
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.replace(`{{${placeholder}}}`, replacement);
  }

  return result;
}

module.exports = { getString };
