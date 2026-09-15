#!/usr/bin/env node
// Script de validação da configuração do Metro e do projeto.
// Execute: node scripts/validate-config.js

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
let ok = true;

function check(label, condition, details) {
  if (condition) {
    console.log('  [OK]', label);
  } else {
    console.error('  [FAIL]', label, details ? `- ${details}` : '');
    ok = false;
  }
}

console.log('\n=== Validação do projeto (ByteBank / tc-03) ===\n');

// 1. metro.config.js existe e carrega sem erro
let metroCfg;
try {
  metroCfg = require(path.join(ROOT, 'metro.config.js'));
  check('metro.config.js carrega sem erro', true);
} catch (e) {
  check('metro.config.js carrega sem erro', false, e.message);
}

if (metroCfg) {
  check('metro.config.js tem server.port = 8081',
    metroCfg.server && metroCfg.server.port === 8081);
  check('metro.config.js tem resolver.sourceExts',
    Array.isArray(metroCfg.resolver && metroCfg.resolver.sourceExts));
  check('metro.config.js inclui svg em sourceExts',
    metroCfg.resolver.sourceExts.includes('svg'));
  check('metro.config.js inclui ttf em assetExts',
    metroCfg.resolver.assetExts.includes('ttf'));
}

// 2. package.json está correto
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
check('package.json main = expo-router/entry',
  pkg.main === 'expo-router/entry',
  `atual: ${pkg.main}`);
check('script start usa --lan',
  (pkg.scripts.start || '').includes('--lan'),
  `atual: ${pkg.scripts.start}`);
check('script start usa --clear',
  (pkg.scripts.start || '').includes('--clear'),
  `atual: ${pkg.scripts.start}`);

// 3. app.json tem NSAppTransportSecurity configurado
const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
const ios = appJson.expo && appJson.expo.ios;
const ats = ios && ios.infoPlist && ios.infoPlist.NSAppTransportSecurity;
check('app.json tem ios.infoPlist.NSAppTransportSecurity', !!ats);
check('ATS tem NSAllowsArbitraryLoads = true',
  ats && ats.NSAllowsArbitraryLoads === true);
check('ATS tem exceção para exp.direct',
  ats && ats.NSExceptionDomains && !!ats.NSExceptionDomains['exp.direct']);
check('ATS tem exceção para localhost',
  ats && ats.NSExceptionDomains && !!ats.NSExceptionDomains['localhost']);

// 4. .expo/settings.json usa LAN
const settings = JSON.parse(fs.readFileSync(path.join(ROOT, '.expo', 'settings.json'), 'utf8'));
check('.expo/settings.json hostType = lan',
  settings.hostType === 'lan',
  `atual: ${settings.hostType}`);

// 5. expo-router/entry.js existe
check('node_modules/expo-router/entry.js existe',
  fs.existsSync(path.join(ROOT, 'node_modules', 'expo-router', 'entry.js')));

// 6. Versões instaladas
const expoVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'node_modules', 'expo', 'package.json'), 'utf8')
).version;
const rnVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'node_modules', 'react-native', 'package.json'), 'utf8')
).version;
const routerVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'node_modules', 'expo-router', 'package.json'), 'utf8')
).version;
const metroVersion = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'node_modules', 'metro', 'package.json'), 'utf8')
).version;

console.log('\n--- Versões instaladas ---');
console.log(`  expo:          ${expoVersion}`);
console.log(`  react-native:  ${rnVersion}`);
console.log(`  expo-router:   ${routerVersion}`);
console.log(`  metro:         ${metroVersion}`);

// 7. Verifica se @expo/ws-tunnel está presente (necessário para --tunnel)
const wsTunnelExists = fs.existsSync(
  path.join(ROOT, 'node_modules', '@expo', 'ws-tunnel')
);
check('@expo/ws-tunnel presente (modo --tunnel disponível)', wsTunnelExists);

// 8. Verifica se .env existe com variáveis Firebase
const envContent = fs.existsSync(path.join(ROOT, '.env'))
  ? fs.readFileSync(path.join(ROOT, '.env'), 'utf8')
  : '';
check('.env existe com EXPO_PUBLIC_FIREBASE_API_KEY',
  envContent.includes('EXPO_PUBLIC_FIREBASE_API_KEY=') &&
  !envContent.match(/EXPO_PUBLIC_FIREBASE_API_KEY=\s*$/m));

console.log('\n=== Resultado:', ok ? 'TUDO OK ✓' : 'HÁ PROBLEMAS ✗', '===\n');
process.exit(ok ? 0 : 1);
