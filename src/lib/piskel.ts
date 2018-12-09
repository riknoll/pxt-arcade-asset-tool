import * as images from "./images";

interface PiskelJSON {
    modelVersion: number;
    piskel: Piskel;
}

interface Piskel {
    name: string;
    description: string;
    fps: number;
    height: number;
    width: number;
    layers: string[];
    hiddenFrames: string[];
}

interface ParsedLayer {
    name: string;
    opacity: number;
    frameCount: number;
    chunks: LayerChunk[];
}

interface LayerChunk {
    layout: number[][];
    base64PNG: string;
    parsed?: ImageInfo;
}


export async function parsePiskelAsync(encoded: string): Promise<PiskelInfo> {
    const file = JSON.parse(atob(encoded)) as PiskelJSON;
    const layers = file.piskel.layers.map(layer => JSON.parse(layer) as ParsedLayer);

    for (const layer of layers) {
        for (const chunk of layer.chunks) {
            chunk.parsed = await images.parseImageAsync(chunk.base64PNG);
        }
    }

    return {
        width: file.piskel.width,
        height: file.piskel.height,
        fps: file.piskel.fps,
        piskelName: file.piskel.name,
        description: file.piskel.description,
        frames: getFrames(layers, file.piskel.width, file.piskel.height)
    }
}

function getFrames(layers: ParsedLayer[], width: number, height: number): ImageInfo[] {
    const frames: ImageInfo[] = [];

    // Layers at higher indices are on top of lower indices
    for (const layer of layers) {

        // Piskel chunks layers if there are a lot of frames
        for (const chunk of layer.chunks) {
            const frameStart = chunk.layout[0][0];
            const frameCount = chunk.layout.length;

            while (frames.length < frameStart + frameCount) {
                frames.push({
                    width: width,
                    height: height,
                    pixels: new Uint8ClampedArray(width * height * 4)
                });
            }

            const chunkData = chunk.parsed.pixels;

            for (let i = 0; i < frameCount; i++) {
                const frame = frames[frameStart + i];
                let framePixelIndex = 0;

                for (let y = 0; y < height; y++) {
                    const rowStart = (y * width * frameCount + i * width) * 4;

                    for (let x = 0; x < width; x++) {
                        const pixelStart = rowStart + x * 4;

                        // Threshold the alpha, not going to do fancy color-layering
                        if (chunkData[pixelStart + 3] > 128) {
                            frame.pixels[framePixelIndex] = chunkData[pixelStart];
                            frame.pixels[framePixelIndex + 1] = chunkData[pixelStart + 1];
                            frame.pixels[framePixelIndex + 2] = chunkData[pixelStart + 2];
                            frame.pixels[framePixelIndex + 3] = 0xff;
                        }

                        framePixelIndex += 4;
                    }
                }
            }
        }
    }


    return frames;
}