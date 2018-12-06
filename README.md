# Asset tool for pxt-arcade

A simple tool for converting images into pxt-arcade's format.

## Try it out

https://riknoll.github.io/pxt-editor-extension-sample

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

## Deploy

To deploy your extension to Github pages, run:

```
npm run deploy
```

## Supported targets
* for PXT/arcade

(The metadata above is needed for package search, update it with the targets you support)

## License

MIT
