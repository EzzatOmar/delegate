import { listen } from '@tauri-apps/api/event'
import { createSignal, onMount, Show } from 'solid-js';
import Main from "./pages/main";
import {connectDb} from "./controller/database";
import { useAlert } from "./hooks/useAlert";
import { updateApp } from "./controller/tauri";

listen('tauri::warning', (event) => {
  console.warn(event);
  const [_, {setAlert}] = useAlert();
  setAlert({children: event.payload as any, duration: 100000, variant: 'warning'});
})

listen('tauri::error', (event) => {
  console.warn(event);
  const [_, {setAlert}] = useAlert();
  setAlert({children: event.payload as any, duration: 100000, variant: 'danger'});
})

function App() {
  const [dbLoaded, setDbLoaded] = createSignal(false);
  const [updater, setUpdateer] = createSignal(false);
  // NOTE: init stuff here when needed
  connectDb().then(db => {setDbLoaded(true)});
  
  onMount(async () => {
    await updateApp();
  })

  return (
    <Show when={dbLoaded()}>
      <Main />
    </Show>
  );
}

export default App;
