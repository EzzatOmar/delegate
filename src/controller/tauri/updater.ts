import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { ask } from '@tauri-apps/api/dialog';
import { getVersion, getName, getTauriVersion } from '@tauri-apps/api/app';

const unlisten = await onUpdaterEvent((data) => {
  console.log('Updater event', data);
});

export async function updateApp () {
  try {
    const { shouldUpdate, manifest } = await checkUpdate();
    console.log(shouldUpdate, manifest);
    console.log(`Current version: ${await getVersion()}`);
    console.log(`App name: ${await getName()}`);
    console.log(`Tauri version: ${await getTauriVersion()}`);
    // await installUpdate().catch(console.error)

    if (shouldUpdate && await ask(`Install new version ${manifest?.version}?`, 'Updatea available')) {
      // display dialog
      await installUpdate()
      // install complete, restart the app
      await relaunch()
    }
  } catch (error) {
    console.log(error)
  }
}