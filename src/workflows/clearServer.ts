import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    let servername = ns.getHostname();
    const api = new XanApi(ns);

    
    let scriptToRemove = "all";

    if (ns.args.length > 0) {
        if (ns.serverExists(String(ns.args[0]))) {
            servername = String(ns.args[0]);
        }
    
        if (ns.args.length > 1) {
            scriptToRemove = String(ns.args[1]);
        }
    }

    if(servername === "home") {
        ns.tprint(`Usage: run ${scriptName} [server] [script]`);
        ns.tprint(`server: server to clear scripts on`);
        ns.tprint(`script: script to remove\n`);
        ns.tprint(`INFO If no server is provided, the current server will be used\nIf no script is provided, all scripts will be removed`);
        ns.tprint("ERROR This script should not be run on home");
        ns.exit();
    }

    if (scriptToRemove === "ALL") {
        api.servers.killAllProcesses(servername);
        api.servers.whipeDrive(servername);
        !api.servers.isCleanServer(servername) ? ns.print(`SUCCESS Cleaned ${servername}`) : ns.print(`ERROR Failed to clean server ${servername}`);
    } else {
        const processesToRemove = api.servers.getProcesses(servername, scriptToRemove);
        if (processesToRemove.length === 0) {
            ns.print(`WARN No processes matching ${scriptToRemove}`);
        } else {
            api.servers.killProcesses(processesToRemove) ? ns.print(`SUCCESS Killed ${processesToRemove.length} processes`) : ns.print(`ERROR Failed to kill processes`);
        }
    }
}