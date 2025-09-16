declare module "three/examples/jsm/loaders/OBJLoader" {
    import { Loader, LoadingManager, Group } from "three";

    export class OBJLoader extends Loader {
        constructor(manager?: LoadingManager);
        parse(text: string): Group;
    }

    export default OBJLoader;
}
