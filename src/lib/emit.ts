import * as palette from "./palette";
import * as util from "./util";

// export function emitProjectAsync(project: Project) {
//     let outScript = libTS;
//     for (const map of project.tileMaps) {
//         outScript += emitTilemapHEX(map);
//     }

//     for (const sheet of project.tileSets) {
//         outScript += emitTilesheetHEX(sheet);
//     }

//     for (const p of project.palettes) {
//         outScript += emitPalette(paletteName(p), palette.encodePalette(p.colors));
//     }

//     return outScript;
// }

// function emitTilemapLoad(map: Tilemap) {
//     return `
//         export function build_${util.escapeIdentifier(map.name)}() {
//             const layer = new TileMapLayer();
//             layer.map = tilemaps.${layerName(map, 0)};
//             layer.tileset = [${map.tileset.images.map((t, i) => "tilesheets." + tileName(map.tileset, i)).join(",")}];
//             layer.palette = palettes.${paletteName(map.tileset.info.palette)};
//             return layer;
//         }
//         `;
// }

// function emitTilesheetHEX(sheet: SpriteSheet) {
//     return `
//         namespace tilesheets {
//             ${sheet.images.map((i, index) => emitImageHex(tileName(sheet, index), "FIXME")).join("")}
//         }`
// }

// function emitTilemapHEX(map: Tilemap) {
//     return `
//         namespace tilemaps {
//             ${map.layers.map((l, index) => emitImageHex(layerName(map, index), l)).join("")}
//             ${emitTilemapLoad(map)}
//         }`
// }

// function emitImageHex(varName: string, encoded: string) {
//     return `
//         //% fixedInstance
//         export const ${util.escapeIdentifier(varName)} = image.ofBuffer(hex\`${encoded}\`);`
// }

// function emitPalette(varName: string, encoded: string) {
//     return `
//         namespace palettes {
//             //% fixedInstance
//             export const ${util.escapeIdentifier(varName)} = hex\`${encoded}\`;
//         }
//         `
// }

// function layerName(map: Tilemap, index: number) {
//     return util.escapeIdentifier(`${map.name}_layer_${index}`);
// }

// function tileName(sheet: SpriteSheet, index: number) {
//     return util.escapeIdentifier(`${sheet.info.name}_tile_${index}`);
// }

// function paletteName(palette: PaletteAsset) {
//     return util.escapeIdentifier(`palette_${palette.name}`);
// }

// const libTS = `
//     class TileMapLayer {
//         map: Image;
//         tileset: Image[];
//         palette: Buffer;
//     }

//     function loadTileMap(layer: TileMapLayer) {
//         scene.setTileMap(layer.map);
//         image.setPalette(layer.palette);
//         for (let i = 1; i < Math.min(layer.tileset.length, 16); i++) {
//             scene.setTile(i, layer.tileset[i - 1]);
//         }
//     }
//     `;

export function emitPalettes(namespace: string, palettes: PaletteFile[]) {
    return `namespace ${util.escapeIdentifier(namespace)} {\n`
    + palettes.map(emitPaletteDeclaration).join("\n")
    + `\n}`
}

function emitPaletteDeclaration(p: PaletteFile) {
    const identifier = util.escapeIdentifier(p.parsed.name || p.name);
    return `    //% fixedInstance\n`
         + `    export const ${util.escapeIdentifier(identifier)} = hex\`${palette.encodePalette(p.parsed.colors)}\`;`
}

export function emitImages(namespace: string, images: EncodedImage[]) {
    return `namespace ${util.escapeIdentifier(namespace)} {\n`
    + images.map(emitImageDeclaration).join("\n")
    + `\n}`
}

function emitImageDeclaration(i: EncodedImage) {
    return `    //% fixedInstance\n`
         + `    export const ${util.escapeIdentifier(i.identifier)} = image.ofBuffer(hex\`${i.encoded}\`);`
}