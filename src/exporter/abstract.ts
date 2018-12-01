export abstract class AbstractEmitter implements ExtensionEmitter {

    protected outputHeader() {
        return `// Auto-generated. Do not edit.`;
    }

    abstract output(obj: any): string;
}