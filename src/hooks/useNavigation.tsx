import { createContext, useContext, JSX, ParentComponent } from "solid-js";
import { createStore } from "solid-js/store";

export type NavigationState = {
  page: string;
  tab: string;
};

export type NavigationValue = [
  state: NavigationState,
  actions: {
    setPage: (page: string) => void;
    setTab: (nav: string) => void;
  }
];

const defaultState = {
  page: "main",
  tab: "chats",
};

const [state, setState] = createStore(defaultState);

const setPage = (page: string) => {
  const allowedPages = ["main"];
  if (!allowedPages.includes(page)) {
    throw new Error(`Invalid page: ${page}`);
  }
  setState("page", page);
}
const setTab = (tab: string) => {
  const allowedNavs = ["chats", "bots"];
  if (!allowedNavs.includes(tab)) {
    throw new Error(`Invalid nav: ${tab}`);
  }
  setState("tab", tab);
}

export const useNavigation = (): NavigationValue => {
  return [state, { setPage, setTab }];
}
