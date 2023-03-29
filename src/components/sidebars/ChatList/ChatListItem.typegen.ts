
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: "scrollToViewPort";
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "scrollToViewPort": "SELECT";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          
        };
        eventsCausingServices: {
          
        };
        matchesStates: "active" | "active.editing" | "active.normal" | "passive" | "passive.editing" | "passive.normal" | { "active"?: "editing" | "normal";
"passive"?: "editing" | "normal"; };
        tags: never;
      }
  