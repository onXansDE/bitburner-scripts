import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptname = ns.getScriptName();

    if(ns.args.length < 1) {
        ns.tprintRaw(`ERROR Ivalid usage`);
        ns.tprintRaw(`Usage: run ${scriptname} <script> [args...]`);
        ns.tprintRaw("script: script to run");
        ns.tprintRaw("args: optional arguments to pass to the script");
        return;
    }
    
    const scriptToExecute = String(ns.args[0]);
    const args = ns.args.slice(1);

    if (!scriptToExecute) {
        ns.print("ERROR No script name provided");
        ns.tail();
        return;
    }

    const api = new XanApi(ns);

    const servers = api.servers.getRootServers(); // Add all server names here

    ns.print(`Running ${scriptToExecute} with [${args.join(", ")}] on all servers`);

    const scriptRam = ns.getScriptRam(scriptToExecute);

    let processes: [string, number][] = [];

    for (const server of servers) {

        if (!ns.fileExists(scriptToExecute, server)) {
            ns.print(`ERROR Script ${scriptToExecute} does not exist on ${server}`);
            continue;
        }

        const possibleThreads = api.files.calculatePossibleThreads(server, scriptRam);

        if(possibleThreads < 1) {
            ns.print(`ERROR Not enough RAM on ${server} to run ${scriptToExecute}`);
            continue;
        }

        const pid = api.files.runScript(server, scriptToExecute, possibleThreads, ...args.map(String));
        processes.push([server, pid]);
    }

    for (const [server, pid] of processes) {
        if(pid !== 0) {
            ns.print(`SUCCESS ${server} -> PID ${pid}`);
        } else {
            ns.print(`ERROR ${server} -> FAILED`);
        }
    }
}
