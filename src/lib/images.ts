import * as palette from "./palette";

export async function parseImageAsync(encoded: string): Promise<ImageInfo> {
    const loaded = await loadImageAsync(encoded);
    const canvas = document.createElement("canvas");
    canvas.width = loaded.width;
    canvas.height = loaded.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(loaded, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return {
        width: data.width,
        height: data.height,
        pixels: data.data
    };
}

async function loadImageAsync(encoded: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>(resolve => {
        const el = document.createElement("img");
        el.src = "data:image/png;base64," + encoded;
        el.onload = () => {
            resolve(el)
        };
    })
}

export function encodeImage(width: number, height: number, data: Uint8ClampedArray, colors = palette.defaultPalette.parsed.colors): string {
    const colorArray = palette.toNumbers(colors);

    return f4EncodeImg(width, height, 4, (x, y) => {
        const index = y * width + x;
        return closestColor(data, index << 2, colorArray);
    });
}

export function encodeSpriteSheet(sheet: SpriteSheet): EncodedImage[] {
    const res: EncodedImage[] = [];

    const source = sheet.source.parsed;
    const columns = Math.floor(source.width / sheet.spriteWidth);
    const rows = Math.floor(source.height / sheet.spriteHeight);

    const colors = palette.toNumbers(sheet.palette.parsed.colors);

    let index = 0;
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows; r++) {
            const left = c * sheet.spriteWidth;
            const top = r * sheet.spriteHeight;

            let getColor = (x: number, y: number) => {
                const index = (left + x) + (top + y) * source.width
                return closestColor(source.pixels, index << 2, colors);
            }

            res.push({
                identifier: sheet.identifier + "_" + index++,
                encoded: f4EncodeImg(sheet.spriteWidth, sheet.spriteHeight, 4, getColor),
                img: imgEncodeImg(sheet.spriteWidth, sheet.spriteHeight, getColor)
            });

            if (index >= sheet.spriteCount) break;
        }
        if (index >= sheet.spriteCount) break;
    }

    return res;
}

export function encodeSprite(sprite: Sprite): EncodedImage {
    const source = sprite.source.parsed;
    const colors = palette.toNumbers(sprite.palette.parsed.colors);

    let getColor = (x: number, y: number) => {
        const index = x + y * source.width
        return closestColor(source.pixels, index << 2, colors);
    }

    return {
        identifier: sprite.identifier,
        encoded: f4EncodeImg(source.width, source.height, 4, getColor),
        img: imgEncodeImg(source.width, source.height, getColor)
    };
}


// use geometric distance on colors
function scale(v: number) {
    return v * v
}

function closestColor(buf: Uint8ClampedArray, pix: number, palette: number[][], alpha = true) {
    if (alpha && buf[pix + 3] < 100)
        return 0 // transparent
    let mindelta = 0
    let idx = -1
    for (let i = alpha ? 1 : 0; i < palette.length; ++i) {
        let delta = scale(palette[i][0] - buf[pix + 0]) + scale(palette[i][1] - buf[pix + 1]) + scale(palette[i][2] - buf[pix + 2])
        if (idx < 0 || delta < mindelta) {
            idx = i
            mindelta = delta
        }
    }
    return idx
}

export function f4EncodeImg(w: number, h: number, bpp: number, getPix: (x: number, y: number) => number) {
    let r = hex2(0xe0 | bpp) + hex2(w) + hex2(h) + "00"
    let ptr = 4
    let curr = 0
    let shift = 0

    let pushBits = (n: number) => {
        curr |= n << shift
        if (shift == 8 - bpp) {
            r += hex2(curr)
            ptr++
            curr = 0
            shift = 0
        } else {
            shift += bpp
        }
    }

    for (let i = 0; i < w; ++i) {
        for (let j = 0; j < h; ++j)
            pushBits(getPix(i, j))
        while (shift != 0)
            pushBits(0)
        if (bpp > 1) {
            while (ptr & 3)
                pushBits(0)
        }
    }

    return r

    function hex2(n: number) {
        return ("0" + n.toString(16)).slice(-2)
    }
}

export function imgEncodeImg(w: number, h: number, getPix: (x: number, y: number) => number) {
    let res = "img`\n    "
    for (let r = 0; r < h; r++) {
        let row: number[] = []
        for (let c = 0; c < w; c++) {
            row.push(getPix(c, r));
        }
        res += row.map(n => n.toString(16)).join(" ");
        res += "\n    "
    }
    res += "`";
    return res;
}