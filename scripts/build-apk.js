import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const projectRoot = path.resolve(import.meta.dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const desktopPath = path.join(os.homedir(), 'Desktop', 'SafeGrid.apk');
const desktopNewVersionPath = path.join(os.homedir(), 'Desktop', 'SafeGrid-v2.5-New.apk');
const apkOutput = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

console.log('--- 1. Building Web Bundle ---');
execSync('npm run build:web', { stdio: 'inherit', cwd: projectRoot });

console.log('--- 2. Syncing to Capacitor Android ---');
execSync('npx cap sync android', { stdio: 'inherit', cwd: projectRoot });

console.log('--- 3. Compiling Native APK with Gradle (JDK 21) ---');
const cmd = 'cmd.exe /c "set JAVA_HOME=C:\\jdk21\\jdk-21.0.12.1+1&& set ANDROID_HOME=C:\\AndroidSdk&& set PATH=C:\\jdk21\\jdk-21.0.12.1+1\\bin;%PATH%&& gradlew.bat assembleDebug --no-daemon"';
execSync(cmd, { stdio: 'inherit', cwd: androidDir });

if (fs.existsSync(apkOutput)) {
  // Copy to both standard and new versioned names on user's Desktop
  fs.copyFileSync(apkOutput, desktopPath);
  fs.copyFileSync(apkOutput, desktopNewVersionPath);
  
  // Also keep copies in project apk folder
  const repoApkDir = path.join(projectRoot, 'apk');
  if (!fs.existsSync(repoApkDir)) {
    fs.mkdirSync(repoApkDir, { recursive: true });
  }
  fs.copyFileSync(apkOutput, path.join(repoApkDir, 'SafeGrid.apk'));
  fs.copyFileSync(apkOutput, path.join(repoApkDir, 'SafeGrid-v2.5-New.apk'));

  const stats = fs.statSync(desktopNewVersionPath);
  console.log('\n======================================================');
  console.log(' SUCCESS: Fresh APKs created directly on your Desktop:');
  console.log(` -> ${desktopNewVersionPath}`);
  console.log(` -> ${desktopPath}`);
  console.log(` -> Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('======================================================\n');
} else {
  console.error('ERROR: APK output not found at', apkOutput);
  process.exit(1);
}
