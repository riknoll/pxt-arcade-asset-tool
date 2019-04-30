type FileRef = number;
type AssetRef = number;

interface SourceFile {
    id: FileRef;
    name: string;

    // Includes the dot
    extension: string;

    // base64 encoded
    data: string;
}

interface PaletteFile extends SourceFile {
    parsed: PaletteInfo;
}

interface PaletteInfo {
    name?: string;
    colors: string[];
}

interface ImageFile extends SourceFile {
    parsed: ImageInfo;
}

interface ImageInfo {
    width: number;
    height: number;
    pixels: Uint8ClampedArray;
}

interface WorkSpace {
    currentId: number;
    files: SourceFile[];
    assets: Asset[];
}

interface Asset {
    identifier: string;
}

interface Sprite extends Asset {
    source: ImageFile;
    palette: PaletteFile;
}

interface SpriteSheet extends Sprite {
    spriteWidth: number;
    spriteHeight: number;
    spriteCount: number;
}

interface EncodedImage {
    identifier: string;
    encoded: string;
    img: string;
}