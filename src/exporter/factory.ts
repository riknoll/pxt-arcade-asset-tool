import { AbstractEmitter } from "./abstract";
import { ConcreteEmitter } from "./concrete";

export class EmitterFactory {

    static getEmitter(target: string): AbstractEmitter {
        return new ConcreteEmitter();
    }
}