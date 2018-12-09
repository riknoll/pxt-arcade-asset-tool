import * as util from "./util";
import * as palette from "./palette";
import * as images from "./images";
import * as piskel from "./piskel";

export const project: WorkSpace = {
    currentId: 1,
    files: [],
    assets: []
}

export async function createFileAsync(file: File): Promise<SourceFile> {
    const newFile: SourceFile = {
        id: newID(),
        extension: file.name.substr(file.name.lastIndexOf(".")).toLowerCase(),
        name: file.name,
        data: null
    };

    const contents = await util.fileReadAsBufferAsync(file);
    const encoded = btoa(util.uint8ArrayToString(contents));

    newFile.data = encoded;

    if (palette.isPaletteFile(newFile.extension)) {
        (newFile as PaletteFile).parsed = palette.parsePaletteFile(newFile);
    }
    else if (newFile.extension === ".png") {
        (newFile as ImageFile).parsed = await images.parseImageAsync(newFile.data)
    }
    else if (newFile.extension === ".piskel") {
        (newFile as PiskelFile).parsed = await piskel.parsePiskelAsync(newFile.data)
    }

    project.files.push(newFile);
    if (newFileCB) newFileCB();

    return newFile;
}

export function retrieveFile(id: FileRef) {
    for (const f of project.files) {
        if (f.id === id) return f;
    }
    return undefined;
}

export function allPalettes(): PaletteFile[] {
    return project.files.filter(f => palette.isPaletteFile(f.extension)) as PaletteFile[];
}

let newFileCB: () => void;

export function onNewFile(cb: () => void) {
    newFileCB = cb;
}

function newID() {
    return project.currentId++;
}