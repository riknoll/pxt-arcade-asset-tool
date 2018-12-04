# MakeCode editor extension sample

Fork this repo to create your own Microsoft MakeCode editor extension (PXT).

An editor extension is an extension to MakeCode that has a custom page hosted on Github pages. 
When a user adds the extension, the MakeCode editor automatically adds a button to the configured toolbox category. Clicking on that button loads an iframe of the editor extension. 

The editor extension is able to show custom UI in that iframe. It's also able to read and write files in the user's project in the format of ``[extension_name].ts`` and ``[extension_name].json``.

This sample handle's all the custom message passing required to read, write and request permissions from the MakeCode editor.

## Try it out

https://samelhusseini.github.io/pxt-editor-extension-sample

## Build

First, install Node.

To build the repo, run:

```
npm install
```

## Development

After this you can run 
```
npm run start
```
to start the dev server.

This will be running on http://localhost:3000

You can edit your React app under ``src`` and the dev server will hot reload it in the browser. Unless you change styles, you generally don't have to reload it to see your changes during development.

When running locally in a web browser, and not in an iframe, read and write operations are stored in localStorage to make debugging easier.

Webpack will generate the bundled app js when running ``npm run start`` or ``npm run deploy``

This repo uses [semantic-ui-react](https://github.com/Semantic-Org/Semantic-UI-React) as the UI framework, but you can substitue it with any

## Structure

```
├── src
│   ├── components
│   │   ├── **/*.tsx (Your React components)
│   ├── exporters
│   │   ├── *.ts (Your emitters)
│   ├── localtypings
│   │   ├── *.d.ts (Your local typings)
│   ├── App.tsx (Main app component)
│   ├── PXTExtension.tsx (Main Extension handler)
├── dist
│   ├── favicon.ico
│   ├── style.css (Your CSS styles)
├── node_modules
├── pxt.json (PXT extension configuration)
├── package.json
├── tsconfig.json
├── tslint.json
├── webpack.dev.json (Webpack dev configuration)
├── webpak.prod.json (Webpack prod configuration)
└── .gitignore
└── LICENSE
└── README.md
```

## Deploy

To deploy your extension to Github pages, run:

```
npm run deploy
```

Once deployed, you can search for your package in the relevant MakeCode editor (eg: https://makecode.microbit.org).

Unless you extension is an Approved extension, you will need to search for it using the full Github repo URL. eg: https://github.com/samelhusseini/pxt-editor-extension-sample

## Supported targets

* for PXT/microbit
* for PXT/adafruit
* for PXT/arcade
* for PXT/codal

(The metadata above is needed for package search, update it with the targets you support)

## License 

MIT
