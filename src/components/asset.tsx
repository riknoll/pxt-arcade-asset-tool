import * as React from "react";

import { Grid, Image, Header, Form, Checkbox, Input, Select, CheckboxProps, FormDropdownProps, InputProps, Segment, Button } from "semantic-ui-react";

import * as workspace from "../lib/workspace";
import * as palette from "../lib/palette";
import * as util from "../lib/util";
import { encodeSpriteSheet, encodeSprite } from "../lib/images";

interface FileInfoProps {
    file: SourceFile;
}

interface FileInfoState {
    output: string;
}

export class FileInfo extends React.Component<FileInfoProps, FileInfoState> {
    builder: AssetBuilder;

    setBuilderRef = (ref: AssetBuilder) => {
        this.builder = ref
        this.onBuilderChange();
    };

    onBuilderChange = () => this.setState({ output: this.getTextOutput() });

    render() {
        let imageSource: string;

        const file = this.props.file;
        if (file.extension === ".png") {
            imageSource = "data:image/png;base64," + file.data;
        }
        const basename = file.name.substr(0, file.name.length - file.extension.length);

        return <div className="file-info">
            <Grid>
                <Grid.Row>
                    { imageSource &&
                        <Grid.Column width="three">
                            <Image className="pixel-image" src={imageSource} fluid centered></Image>
                        </Grid.Column>
                    }
                    <Grid.Column width="ten">
                        <Grid.Row>
                            <Header size="medium" textAlign="left">{file.name}</Header>
                            { this.hasAsset() ?
                                <AssetBuilder basename={basename} ref={this.setBuilderRef} onChange={this.onBuilderChange} info={(file as ImageFile).parsed} /> :
                                <div className="palette-preview" style={{background: mkGradient((this.props.file as PaletteFile).parsed.colors)}} ></div>
                            }
                        </Grid.Row>
                    </Grid.Column>
                    <Grid.Column width="three">
                            <CodePreview text={this.state && this.state.output} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    }

    getAsset(): Sprite | SpriteSheet {
        let selectedPalette = palette.defaultPalette;
        const paletteName = this.builder.state.palette;

        if (paletteName && paletteName != "__default__") {
            const id = parseInt(paletteName.substr(paletteName.lastIndexOf("_") + 1));
            for (const f of workspace.allPalettes()) {
                if (f.id === id) selectedPalette = f;
            }
        }


        if (this.builder.state.isSpriteSheet) {
            const sheet: SpriteSheet = {
                identifier: value(this.builder.state.identifier),
                source: this.props.file as ImageFile,
                palette: selectedPalette,
                spriteWidth: parseInt(value(this.builder.state.spriteWidth)),
                spriteHeight: parseInt(value(this.builder.state.spriteHeight)),
                spriteCount: parseInt(value(this.builder.state.spriteCount)),
            };
            return sheet;
        }
        else {
            const sprite: Sprite = {
                identifier: value(this.builder.state.identifier),
                source: this.props.file as ImageFile,
                palette: selectedPalette
            };
            return sprite;
        }
    }

    getTextOutput() {
        const asset = this.getAsset();
        if ((asset as SpriteSheet).spriteCount != undefined) {
            const encoded = encodeSpriteSheet(asset as SpriteSheet);

            return encoded.map((e, i) => `const ${asset.identifier}_${i} = ${e.img};`).join("\n\n")
        }
        else {
            const encoded = encodeSprite(asset as Sprite);
            return `const ${asset.identifier} = ${encoded.img};`
        }
    }

    hasAsset() {
        return !palette.isPaletteFile(this.props.file.extension);
    }
}

interface AssetBuilderProps {
    info: ImageInfo;
    basename: string;
    onChange: () => void;
}

interface AssetBuilderState {
    isSpriteSheet: boolean;
    palette: string;

    identifier: FieldValue;

    spriteWidth?: FieldValue;
    spriteHeight?: FieldValue;
    spriteCount?: FieldValue;
}

interface FieldValue {
    text: string;
    err?: string;
}

type EventHandler<U> = (event: React.FormEvent<HTMLInputElement>, data: U) => void;

export class AssetBuilder extends React.Component<AssetBuilderProps, AssetBuilderState> {
    private handlers: { [index: string]: EventHandler<InputProps>} = {};
    private checkboxes: { [index: string]: EventHandler<CheckboxProps>} = {};
    private dropdowns: { [index: string]:  EventHandler<FormDropdownProps>} = {};

    constructor(props: AssetBuilderProps) {
        super(props);

        const count = Math.floor(props.info.width / 16) * Math.floor(props.info.height / 16)

        this.state = {
            isSpriteSheet: false,
            palette: undefined,
            identifier: { text: util.escapeIdentifier(props.basename) },
            spriteWidth: { text: "16" },
            spriteHeight: { text: "16" },
            spriteCount: { text: "" + count }
        };
    }

    handleTextChange(fieldName: string, isNumber = false) {
        if (!this.handlers[fieldName]) {
            this.handlers[fieldName] = ev => {
                const val: FieldValue = { text: (ev.target as HTMLInputElement).value };

                if (isNumber) {
                    let parsed = parseInt(val.text);
                    if (isNaN(parsed)) {
                        val.err = "Please enter a number";
                    }
                }

                let stateTransaction: any = {};
                stateTransaction[fieldName] = val;
                this.setState(stateTransaction, this.props.onChange);
            };
        }
        return this.handlers[fieldName];
    }

    handleCheckboxChange(fieldName: string) {
        if (!this.checkboxes[fieldName]) {
            this.checkboxes[fieldName] = (ev, props) => {
                let stateTransaction: any = {};
                stateTransaction[fieldName] = props.checked;
                this.setState(stateTransaction, this.props.onChange);
            };
        }
        return this.checkboxes[fieldName];
    }

    handleDropdownChange(fieldName: string) {
        if (!this.dropdowns[fieldName]) {
            this.dropdowns[fieldName] = (ev, props) => {
                let stateTransaction: any = {};
                stateTransaction[fieldName] = props.value;
                this.setState(stateTransaction, this.props.onChange);
            };
        }
        return this.dropdowns[fieldName];
    }

    render() {
        return <div>
            <Form>
                <Form.Field>
                    <Checkbox toggle label="Sprite sheet" value={this.state.isSpriteSheet + ""} onChange={this.handleCheckboxChange("isSpriteSheet")} />
                </Form.Field>
                <Form.Field
                    control={Input}
                    label='Image Name'
                    placeholder='A JavaScript identifier'
                    value={this.state.identifier.text}
                    onChange={this.handleTextChange("identifier")} />
                <Form.Field control={Select} label='Palette' options={getPaletteOptions()} placeholder='Default Palette' onChange={this.handleDropdownChange("palette")}/>
                {
                    this.state.isSpriteSheet ?
                        <Form.Group widths="equal">
                            <Form.Field
                                control={Input}
                                label='Sprite Width'
                                placeholder='Width in pixels'
                                value={value(this.state.spriteWidth)}
                                onChange={this.handleTextChange("spriteWidth")} />
                            <Form.Field
                                control={Input}
                                label='Sprite Height'
                                placeholder='Height in pixels'
                                value={value(this.state.spriteHeight)}
                                onChange={this.handleTextChange("spriteHeight")} />
                            <Form.Field
                                control={Input}
                                label='Sprite Count'
                                placeholder='Number of sprites'
                                value={value(this.state.spriteCount)}
                                onChange={this.handleTextChange("spriteCount")} />
                        </Form.Group>
                        : undefined
                }
            </Form>

        </div>
    }
}

interface SelectOption {
    key: string;
    text: string;
    value: string;
}

function getPaletteOptions() {
    const options: SelectOption[] = [];

    options.push({
        key: "__default__",
        text: "default",
        value: "__default__"
    });

    workspace.allPalettes().forEach(p => {
        options.push({
            key: "palette_" + p.id,
            text: palette.getName(p),
            value: "palette_" + p.id
        });
    })

    return options;
}

function value(val: FieldValue) {
    return val ? val.text : "";
}

function mkGradient(colors: string[]) {
    const colorStrings: string[] = [];
    for (let i = 0; i < 16; i++) {
        const color = colors[i] || "#000000";
        colorStrings.push(`${color} ${i * 6.25}%, ${color} ${(i + 1) * 6.25}%`);
    }
    return `linear-gradient(to right, ${colorStrings.join(", ")})`;
}

interface CodePreviewProps {
    text: string;
}

class CodePreview extends React.Component<CodePreviewProps> {
    input: HTMLTextAreaElement;

    handleTextRef = (i: HTMLTextAreaElement) => this.input = i;

    handleCopy = () => {
        if (!this.input) return;

        this.input.focus();
        this.input.setSelectionRange(0, 9999);

        try {
            const success = document.execCommand("copy");
        } catch (e) {
        }
    };

    render() {
        return <Segment inverted className="code-preview">
            <textarea className="code-content" ref={this.handleTextRef} contentEditable={false} value={this.props.text || ""}></textarea>
            <Button className="code-copy" onClick={this.handleCopy}>Copy</Button>
        </Segment>
    }
}
