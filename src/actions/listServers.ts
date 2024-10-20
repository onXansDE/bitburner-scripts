import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    let servername = ns.getHostname();
    const api = new XanApi(ns);

    const servers = api.servers.getAllServers();

    const sortedServers = servers.sort(sortByMaxMoney);

    let longestLine = "";

    for (const s of sortedServers) {
        const server = ns.getServer(s);
        const output = api.formating.getServerDisplayString(server);
        longestLine = output.length > longestLine.length ? output : longestLine;
        ns.print(output);
    }

    ns.tail();
    ns.resizeTail(api.ui.getTextWidth(longestLine), api.ui.getHeightForLines(sortedServers.length));

    function sortByMaxMoney(a: string, b: string): number {
        return ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a);
    }
}

