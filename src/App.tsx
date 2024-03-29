import { listen } from '@tauri-apps/api/event'
import { createSignal, onMount, Show } from 'solid-js';
import Main from "./pages/main";
import {connectDb, getVersion} from "./controller/database";
import { useAlert } from "./hooks/useAlert";
import { updateApp } from "./controller/tauri";
import { onUpdaterEvent } from '@tauri-apps/api/updater';

listen('tauri::warning', (event) => {
  console.warn(event);
  const [_, {setAlert}] = useAlert();
  setAlert({children: event.payload as any, duration: 150000, variant: 'warning'});
})

listen('tauri::error', (event) => {
  console.warn(event);
  const [_, {setAlert}] = useAlert();
  setAlert({children: event.payload as any, duration: 150000, variant: 'danger'});
})

onUpdaterEvent((data) => {
  console.log('Updater event', data);
});

function App() {
  const [dbLoaded, setDbLoaded] = createSignal(false);
  const [updater, setUpdateer] = createSignal(false);
  // NOTE: init stuff here when needed
  connectDb().then(db => {setDbLoaded(true)});
  
  onMount(async () => {
    await updateApp();
    getVersion().then(console.log)
  })

  return (
    <Show when={dbLoaded()}>
      <Main />
    </Show>
  );
}

export default App;
