
# BUGS

- [ ] fix tauri warning  
  ![tauri warning](./todo-images/warnings.excalidraw.png "tauri warning")
- [ ]  
  ![spinner position](./todo-images/spinner_position.excalidraw.png "spinner position")

# Release v.0.1.4  

- auto name chat title with chat gpt
- full text search: use FTS5
- increase default app window size
- bugfix: scroll issue
- max width for chat window

# TODO

- [ ] upload document
- [ ] update readme screenshot, add roadmap diagram
- [ ] reduce size of stream messages, currently size increases O(n^2), with n = tokens
- [ ] add discussion link <https://github.com/EzzatOmar/delegate/discussions>
- [ ] save text as tiptap json
- [ ] add code formater in text input
- [ ] write architecture docs
- [ ] auto title naming: add setting to disable
- [ ] auto title naming: add button to regenerate
- [ ] sidebar item, on click outside exit edit mode of ChatListItem
  - ![click outside](./todo-images/click-outside.excalidraw.png "click outside")
- [ ] parse GlobalError in FE, handle
- [ ] loading button state
  - ![loading button state](./todo-images/button-loading.excalidraw.png "loading button state")

# Features

- [ ] render lists  
  ![render lists](./todo-images/render-lists.excalidraw.png "render lists")
- [ ] add system tray
- [ ] create multiple openai completion bot by model (ada, babbage, davinci, etc)

# Roadmap

- [ ] website + download
- [ ] other opanai text apis
- [ ] other chat bot apis
- [ ] agent system -> glue many bots into one agent
- [ ] locally run delegate bot
- [ ] prompt template
- [ ] rewrite chat panel, use richtexteditor like tiptap
- [ ] llama alpaca
- [ ] text -> image
- [ ] plugin system

# Other

- [ ] reqwest lib might be included as tauri feature `reqwest-client`, check if that's better
