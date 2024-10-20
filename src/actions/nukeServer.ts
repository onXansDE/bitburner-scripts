import { NS } from "@ns";
import { ServerHandler } from "/lib/server";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    
    const serverHandler = new ServerHandler(ns);

    let servername = "all";

    if (ns.args.length === 1) {
        servername = String(ns.args[0]);
    } else if (ns.args.length > 1) {
        ns.tprintRaw("Usage: run rootServer.js <servername|all>");
        return;
    }

    if (servername === "all") {
        ns.print("Trying to hack all servers");
        const servers = serverHandler.getAllServers();
        for (const server of servers) {
            const serverObj = ns.getServer(server);
            serverHandler.nukeServer(serverObj);
        }
    } else {
        ns.print(`Hacking ${servername}`);
        const server = ns.getServer(servername);
        serverHandler.nukeServer(server);
    }
    
    ns.tail();
}
