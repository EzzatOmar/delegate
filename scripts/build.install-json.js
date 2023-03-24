const fetch = require('node-fetch');
const fs = require('fs');

async function getVersion() {
  const url = 'https://github.com/EzzatOmar/delegate/releases/latest';
  const res = await fetch(url);
  const version = res.url.split('/').at(-1).substring(5);
  return version;
}

async function getSignature(version, platform) {
  let url;
  if(platform === 'darwin-aarch64') {
    url = `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_silicon.app.tar.gz.sig`;

  } else if(platform === 'darwin-x86_64') {
    url = `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_intel.app.tar.gz.sig`

  } else if(platform === 'linux-x86_64') {
    url = `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_linux_x86_64.AppImage.tar.gz.sig`

  } else if(platform === 'windows-x86_64') {
    url = `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_windows_x86_64.msi.zip.sig`;
  } else {
    throw new Error('Platform not supported');
  }
  console.log(url)
  const res = await fetch(url);
  return await res.text();
}

async function createInstallJson(version) {
  const currentDate = new Date().toISOString();

  return {
    "version": version,
    "notes": "new version",
    "pub_date": currentDate,
    "platforms": {
      "darwin-aarch64": {
        "signature": await getSignature(version, 'darwin-aarch64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_silicon.dmg`
      },
      "darwin-x86_64": {
        "signature": await getSignature(version, 'darwin-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_intel.dmg`
      },
      "linux-x86_64": {
        "signature": await getSignature(version, 'linux-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_linux_x86_64.deb`
      },
      "windows-x86_64": {
        "signature": await getSignature(version, 'windows-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_windows_x86_64.msi`
      }
    }
  }
}

async function run() {
  const version = await getVersion();
  const json = await createInstallJson(version);
  console.log(json);
  fs.writeFileSync('updater/install.json', JSON.stringify(json, null, 2));
}

run();