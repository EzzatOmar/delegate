import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { ask } from '@tauri-apps/api/dialog';

export async function updateApp () {
  try {
    const { shouldUpdate, manifest } = await checkUpdate()
    console.log(shouldUpdate, manifest)

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