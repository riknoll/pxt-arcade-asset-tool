import { AbstractEmitter } from "./abstract";
import { MicrobitEmitter } from "./microbit";

export class EmitterFactory {

    static getEmitter(target: string): AbstractEmitter {
        switch (target) {
            case 'microbit':
                return new MicrobitEmitter();
            default:
                return undefined;
        }
    }
}