import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    let servername = ns.getHostname();
    const api = new XanApi(ns);
    
    // usage: run clearAllServers [includeHome]
    // includeHome: include home in the list of servers to clear
    const includeHome = ns.args.length > 0 && ns.args[0] === true;

    const servers = api.servers.getRootServers();
    ns.print(`INFO Clearing all servers`);
    if (includeHome) {
        servers.push("home");
        // kill all processes on home except for the current script
        const procs = api.servers.getProcesses("home").filter(p => ns.pid !== p);
        procs.forEach(p => ns.kill(p));
        const procsAfter = api.servers.getProcesses("home").filter(p => ns.pid !== p).length;
        ns.print(`INFO Killed ${procs.length - procsAfter} processes on home`);
    }

    for (const server of servers) {
        api.servers.killAllProcesses(server);
        api.servers.whipeDrive(server);
        !api.servers.isCleanServer(server) ? ns.print(`SUCCESS Cleaned ${server}`) : ns.print(`ERROR Failed to clean server ${server}`);
    }
}
