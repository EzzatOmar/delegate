/* @refresh reload */
import { render } from "solid-js/web";
import './index.css';
import App from "./App";

async function main() {

  render(() => <App />, document.getElementById("root") as HTMLElement);
}

main();