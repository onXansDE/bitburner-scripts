import { NS } from "@ns";
import { FileHandler } from "./files";
import { TextFormater } from "./formating";
import { ServerHandler } from "./server";
import { UIHandler } from "./ui";

export class XanApi {
    public servers: ServerHandler;
    public formating: TextFormater;
    public ui: UIHandler;
    public files: FileHandler;

    constructor(ns: NS) {
        this.servers = new ServerHandler(ns);
        this.formating = new TextFormater(ns);
        this.ui = new UIHandler(ns);
        this.files = new FileHandler(ns);
    }
}


