const { exec } = require('child_process');
const buildInfo = require('../android/app/build/outputs/apk/release/output-metadata.json');

const version = buildInfo.elements[0].versionName;
const versionCode = buildInfo.elements[0].versionCode;

const basename = `tonkeeper-${version}.${versionCode}`;

const pathExp = __dirname.split('/');
pathExp.pop();
const path = pathExp.join('/');

const apkInPath = `${path}/android/app/build/outputs/apk/release/app-release.apk`;
const aabInPath = `${path}/android/app/build/outputs/bundle/release/app-release.aab`;

const dumpPath = `${path}/android/app/build/outputs`;

exec(`cp ${apkInPath} ${dumpPath}/${basename}.apk`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
});
exec(`cp ${aabInPath} ${dumpPath}/${basename}.aab`, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
});
