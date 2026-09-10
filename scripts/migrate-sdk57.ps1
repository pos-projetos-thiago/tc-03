Set-Location "C:\Users\Thiago\Desktop\PosTech\fase3\tc-03"

Write-Host "=== SDK 57 Migration Script ===" -ForegroundColor Cyan

# Step 1: Install core expo packages
Write-Host "`n[1/4] Installing Expo core packages..." -ForegroundColor Yellow
npm install `
  "expo@~57.0.17" `
  "expo-router@~57.0.0" `
  "expo-constants@~57.0.0" `
  "expo-document-picker@~57.0.0" `
  "expo-file-system@~57.0.0" `
  "expo-font@~57.0.0" `
  "expo-haptics@~57.0.0" `
  "expo-image@~57.0.0" `
  "expo-image-picker@~57.0.0" `
  "expo-linking@~57.0.0" `
  "expo-splash-screen@~57.0.8" `
  "expo-status-bar@~57.0.0" `
  "expo-symbols@~57.0.0" `
  "expo-system-ui@~57.0.0" `
  "expo-web-browser@~57.0.0" `
  --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR in step 1" -ForegroundColor Red
    exit 1
}

# Step 2: Install react-native and react
Write-Host "`n[2/4] Installing React Native and React..." -ForegroundColor Yellow
npm install `
  "react-native@0.86.3" `
  "react@19.2.0" `
  "react-dom@19.2.0" `
  "react-native-web@~0.21.0" `
  "@types/react@~19.2.0" `
  --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR in step 2" -ForegroundColor Red
    exit 1
}

# Step 3: Install native animation/gesture libraries
Write-Host "`n[3/4] Installing native libraries..." -ForegroundColor Yellow
npm install `
  "react-native-reanimated@~4.5.0" `
  "react-native-worklets@~0.10.0" `
  "react-native-gesture-handler@~2.32.0" `
  "react-native-screens@~4.26.0" `
  "react-native-safe-area-context@~5.7.0" `
  "@shopify/react-native-skia@2.6.2" `
  "react-native-svg@~15.15.4" `
  --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR in step 3" -ForegroundColor Red
    exit 1
}

# Step 4: Remove old react-navigation packages
Write-Host "`n[4/4] Removing obsolete react-navigation packages..." -ForegroundColor Yellow
npm uninstall `
  "@react-navigation/bottom-tabs" `
  "@react-navigation/elements" `
  "@react-navigation/native" `
  --legacy-peer-deps

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR in step 4" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Migration install complete ===" -ForegroundColor Green
