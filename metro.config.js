// metro.config.js — Expo SDK 57 / React Native 0.86
// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Garante que o Metro escuta em todas as interfaces de rede (0.0.0.0),
// não apenas em localhost — necessário para acesso via LAN em dispositivos físicos.
// O valor padrão do Expo SDK 57 já é "::" (IPv6 all-interfaces), mas tornamos
// explícito para evitar regressões em ambientes Windows que podem resolver
// "::" para apenas loopback.
config.server = {
  ...config.server,
  // Porta padrão do Metro / React Native
  port: 8081,
};

// Garante suporte a extensões de arquivo do Expo Router e SVG
config.resolver = {
  ...config.resolver,
  // Mantém as extensões padrão e adiciona suporte a arquivos de asset extras
  assetExts: [
    ...(config.resolver.assetExts ?? []).filter((ext) => ext !== 'svg'),
    'ttf',
    'otf',
    'woff',
    'woff2',
  ],
  sourceExts: [
    ...(config.resolver.sourceExts ?? []),
    'svg',
    'mjs',
    'cjs',
  ],
};

module.exports = config;
