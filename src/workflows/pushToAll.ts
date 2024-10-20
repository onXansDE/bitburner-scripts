import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();

    if(ns.args.length < 1) {
        ns.tprintRaw(`ERROR Ivalid usage`);
        ns.tprintRaw(`Usage: run ${scriptName} [scripts...]`);
        ns.tprintRaw("scripts: scripts to distribute");
        return;
    }

    const api = new XanApi(ns);
    
    const scriptNames = ns.args.map(arg => String(arg));

    if (scriptNames.length === 0) {
        ns.print("ERROR No script name provided");
        return;
    }

    let errors = false;

    const existingFiles = api.files.searchFiles(scriptNames);
    if (existingFiles.length !== scriptNames.length) {
        // print error for each missing file
        scriptNames.forEach(scriptName => {
            if (!existingFiles.includes(scriptName)) {
                ns.print(`ERROR ${scriptName} not found`);
                errors = true;
            }
        });
    }

    if (existingFiles.length === 0) {
        ns.print("ERROR No valid script names provided");
        ns.tail();
        return;
    }


    const servers = api.servers.getRootServers();
    ns.print(`Installing ${existingFiles.join(", ")} on all servers`);

    for (const server of servers) {
        if(api.files.pushToServer(server, existingFiles)) {
            ns.print(`SUCCESS Installed on ${server}`);
        } else {
            ns.print(`ERROR Failed to install on ${server}`);
            errors = true;
        }
    }

    if (errors) {
        ns.tprint("ERROR Some scripts failed to install");
    }
}
