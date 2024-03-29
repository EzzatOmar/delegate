import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { ask } from '@tauri-apps/api/dialog';
import { getVersion, getName, getTauriVersion } from '@tauri-apps/api/app';

export async function updateApp () {
  try {
    const { shouldUpdate, manifest } = await checkUpdate();
    console.log('update available?', shouldUpdate, manifest);
    console.log(`Current version: ${await getVersion()}`);
    console.log(`App name: ${await getName()}`);
    console.log(`Tauri version: ${await getTauriVersion()}`);

    if (shouldUpdate) {
      let body = manifest?.body ?? 'No description';
      try {
        body = JSON.parse(body);
      } catch (error) {
        console.error(error);
      }
      const message = `Install new version ${manifest?.version}?
      ${Array.isArray(body) ? body.join('\n') : body}
      `;
      const confirm = await ask(message, 'Updates available');
      if(!confirm) return;

      // display dialog
      await installUpdate()
      // install complete, restart the app
      await relaunch()
    }
  } catch (error) {
    console.log(error)
  }
}