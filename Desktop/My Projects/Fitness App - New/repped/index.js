// Proxy entry point for Metro monorepo workspace resolution
// Metro resolves from the workspace root in Expo SDK 54+
// This re-exports the mobile app's entry point
module.exports = require("expo-router/entry");
