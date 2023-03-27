const fetch = require('node-fetch');
const fs = require('fs');

function parseChangelog() {
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const result = {};
  changelog.split('# Release').forEach((section) => {
    const [first, ...rest] = section.split('\n');
    if(rest.length > 0) {
      const key = first.substring(3).trim();
      const value = rest.filter(x => x).filter(x => x.startsWith('- ')).map(x => x.substring(2).trim())
      result[key] = value;
    }
  });
  return result;
}

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
  const changelog = parseChangelog()[version];
  if(!changelog) throw new Error('Changelog not found for version: ' + version);

  return {
    "version": version,
    "notes": JSON.stringify(changelog) ?? 'No changelog available',
    "pub_date": currentDate,
    "platforms": {
      "darwin-aarch64": {
        "signature": await getSignature(version, 'darwin-aarch64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_silicon.app.tar.gz`
      },
      "darwin-x86_64": {
        "signature": await getSignature(version, 'darwin-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_mac_intel.app.tar.gz`
      },
      "linux-x86_64": {
        "signature": await getSignature(version, 'linux-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_linux_x86_64.AppImage.tar.gz`
      },
      "windows-x86_64": {
        "signature": await getSignature(version, 'windows-x86_64'),
        "url": `https://github.com/EzzatOmar/delegate/releases/download/app-v${version}/Delegate_${version}_windows_x86_64.msi.zip.sig`
      }
    }
  }
}

async function run() {
  const version = await getVersion();
  const json = await createInstallJson(version);
  fs.writeFileSync('updater/install.json', JSON.stringify(json, null, 2));
}

run();