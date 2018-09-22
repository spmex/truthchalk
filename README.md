# TruthChalk
A Chrome extension to annotate statements as True/False in any website, refactored from [truth-annotator](https://github.com/archlyx/truth-annotator) using Vue.js.
Features:
* Automatically select the current sentence when clicking on any text.
* Highlight annotations made by other users in the current page.
* A dashboard in the popup page to check the annotations you have made. (ToDo)

## Usage
![Demo Animation](../assets/demo.gif?raw=true)

* Press `Ctrl` and start selecting the sentence.
* Select true or false on the popup bar.
* Click any other area to save your annotation.
* Account registration from the popup page is required to save the annotations.

## Build
``` bash
cd truthchalk

# Install dependencies
npm install

# Build the extension directory with hot reloading
npm run dev
```

## Install
Currently the extension can only be installed under the developer mode of Chrome.
In the Extensions interface of Chrome, switch on the developer mode on the top right and use `load unpacked` option to load the extension from `/dist` in the root directory.

# Credit
* Great [vue.js + webpack scaffold](https://github.com/ALiangLiang/vue-webpack-chrome-extension-template) for Chrome extension by [@ALiangLiang](https://github.com/ALiangLiang)
