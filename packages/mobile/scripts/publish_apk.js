const { exec } = require('child_process');
const buildInfo = require('../android/app/build/outputs/apk/release/output-metadata.json');
require('dotenv').config();

const version = buildInfo.elements[0].versionName;
console.info('Publish version:', version);

const pathExp = __dirname.split('/');
pathExp.pop();
const path = pathExp.join('/');

const inPath = `${path}/android/app/build/outputs/apk/release/app-release.apk`;
const outPath = `/var/uploads/apk/tonkeeper-${version}.apk`;

console.info('Publishing..');
exec(
  `rsync -avzh ${inPath} ${process.env['TONKEEPER_APK_HOSTNAME']}:${outPath}`,
  (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }

    if (stdout) {
      console.log(`stdout: ${stdout}`);
      setVersion();
    }

    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  },
);

function updateMetadata() {
  console.log('updateMetadata');
  exec(
    `ssh ${process.env['TONKEEPER_APK_HOSTNAME']} "node ~/tonendpoint/scripts/update-metadata.js"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
    },
  );
}

function setVersion() {
  console.log('setVersion', version);
  exec(
    `ssh ${process.env['TONKEEPER_APK_HOSTNAME']} "echo \\"${version}\\" > /var/uploads/apk/latest"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      } else {
        createSymlink();
      }

      updateMetadata();
    },
  );
}

function createSymlink() {
  console.log('createSymlink');
  exec(
    `ssh ${process.env['TONKEEPER_APK_HOSTNAME']} "ln -sf ${outPath} /var/uploads/apk/tonkeeper.apk"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }

      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
    },
  );
}
