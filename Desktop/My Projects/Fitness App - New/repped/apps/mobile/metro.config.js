const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

// Use absolute path — critical for monorepo workspace root detection
const projectRoot = path.resolve(__dirname);
const monorepoRoot = path.resolve(projectRoot, "../..");

// Pass absolute path to getDefaultConfig
const config = getDefaultConfig(projectRoot);

// Override projectRoot to absolute (Expo sets it to "." otherwise)
config.projectRoot = projectRoot;

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// For packages hoisted to monorepo root
const rootModules = path.resolve(monorepoRoot, "node_modules");
const mobileModules = path.resolve(projectRoot, "node_modules");

const extraNodeModules = {};
if (fs.existsSync(rootModules)) {
  for (const name of fs.readdirSync(rootModules)) {
    if (name.startsWith(".")) continue;
    const mobilePath = path.join(mobileModules, name);
    const rootPath = path.join(rootModules, name);
    extraNodeModules[name] = fs.existsSync(mobilePath) ? mobilePath : rootPath;
  }
}

config.resolver.extraNodeModules = extraNodeModules;

module.exports = config;
