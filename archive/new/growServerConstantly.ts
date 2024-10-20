import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    let server = ns.getHostname();

    if(ns.args.length === 1) {
        server = String(ns.args[0]);
    }

    if (server === "home") {
        ns.tprint("This script should not be run on home");
        return;
    }

    ns.print(`Growing ${server} constantly`);

    while (true) {
        var result = await ns.grow(server);
        ns.print(`Grew ${server} by ${result}%`);
    }
}
