/// <reference path="./localtypings/extension.d.ts" />

import * as React from 'react';

import { List, Header, Button, Container, Message } from "semantic-ui-react";

import { pxt, PXTClient } from '../lib/pxtextensions';
import { EmitterFactory } from "./exporter/factory";

import * as util from "./lib/util";
import * as workspace from "./lib/workspace";
import * as images from "./lib/images";
import * as emit from "./lib/emit";

import { FileInfo } from "./components/asset";

export interface AppProps {
    client: PXTClient;
    target: string;
}

export interface AppState {
    target: string;
}

let initDrag = false;

export class App extends React.Component<AppProps, AppState> {
    private files: FileInfo[] = [];

    constructor(props: AppProps) {
        super(props);

        this.state = {
            target: props.target
        }

        this.deserialize = this.deserialize.bind(this);
        this.serialize = this.serialize.bind(this);

        props.client.on('read', this.deserialize);
        props.client.on('hidden', this.serialize);

        workspace.onNewFile(() => {
            this.forceUpdate();
        })

        this.downloadProject = this.downloadProject.bind(this);
        this.handleFileRef = this.handleFileRef.bind(this);
        this.handleAppRef = this.handleAppRef.bind(this);
    }

    private handleFileRef(ref: FileInfo) {
        this.files.push(ref);
    }

    private handleAppRef(ref: HTMLDivElement) {
        if (!initDrag) {
            util.setupDragAndDrop(ref, f => !workspace.project.files.some(s => s.name === f.name), async files => {
                for (const f of files) {
                    await workspace.createFileAsync(f);
                }
            });
            initDrag = true;
        }
    }

    private deserialize(resp: pxt.extensions.ReadResponse) {
        if (resp && resp.json && resp.json.length > 0) {
            const code = resp.code;
            const json = JSON.parse(resp.json);
            console.log('reading code and json', code, json);
        }
    }

    private serialize() {
        // PXT allows us to write to files in the project [extension_name].ts and [extension_name].json
        console.log("write code and json");

        const { target } = this.state;
        const emitter = EmitterFactory.getEmitter(target);
        if (!emitter) return;

        const code = emitter.output(undefined);
        const json = {};
        pxt.extensions.write(code, JSON.stringify(json));
    }

    private downloadProject() {
        const assets: EncodedImage[] = [];
        const palettes = workspace.allPalettes();

        for (const f of this.files) {
            if (!f.hasAsset()) continue;

            const asset = f.getAsset();
            if ((asset as SpriteSheet).spriteCount != undefined) {
                assets.push(...images.encodeSpriteSheet(asset as SpriteSheet));
            }
            else {
                assets.push(images.encodeSprite(asset as Sprite));
            }
        }
        let ts = emit.emitImages("projectImages", assets);

        if (palettes.length) {
            ts += "\n" + emit.emitPalettes("palettes", palettes);
        }

        util.browserDownloadText(ts, "assets.ts");
    }

    render() {
        return (
            <div className="App" ref={this.handleAppRef}>
                <Container>
                    <Message>
                    <Message.Header>Microsoft MakeCode Arcade asset tool</Message.Header>
                    <p style={{textAlign: "left"}}>
                        Drag and drop images onto this page to add them to your workspace. Currently
                        .png files are supported for images and .hex, .txt, and .gpl files are supported
                        for image palettes. Press export to get a .ts file with your assets encoded.
                    </p>
                    </Message>
                    <div className="file-list-header">
                        <Header as="h1">Project Files</Header>
                    </div>
                    <div className="file-list">
                        <List>
                            { workspace.project.files.map(f =>
                                <List.Item key={"file_" + f.id}>
                                    <FileInfo ref={this.handleFileRef} file={f} />
                                </List.Item>)
                            }
                        </List>
                    </div>
                    <div className="export-controls">
                        <Button floated="right" onClick={this.downloadProject}>
                            Export
                        </Button>
                    </div>
                </Container>
            </div>
        );
    }
}