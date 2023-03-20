import { checkUpdate } from '@tauri-apps/api/updater';

export async function updateApp () {
  console.log('TODO: updateApp');
  const update = await checkUpdate();
  console.log('TODO: updateApp', update);
  // check for updates
  // if update available, prompt user
  // if user accepts, download and install
}