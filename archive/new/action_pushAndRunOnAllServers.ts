import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    const current_script = ns.getScriptName();
    if(ns.args.length < 1) {
        ns.tprintRaw(`Usage: run ${current_script} <script> [args...]`);
        ns.tprintRaw("args: optional arguments to pass to the script");
        return;
    }
    
    const scriptName = String(ns.args[0]);
    const args = ns.args.slice(1);

    if (!ns.fileExists(scriptName)) {
        ns.tprint(`Script ${scriptName} does not exist`);
        return;
    }
    ns.tprint(`Installing and running ${scriptName} with [${args.join(", ")}] on all servers`);

    var pushPid = ns.exec("util_pushToAll.js", "home", 1, scriptName);

    if (pushPid === 0) {
        ns.tprint("Failed to start push script");
        ns.tail(pushPid);
        return;
    }

    // wait for push script to finish
    while (ns.isRunning(pushPid)) {
        await ns.sleep(300);
    }

    ns.tprint(`Starting ${scriptName} on all servers`);

    var runPid = ns.exec("util_runOnAll.js", "home", 1, ...ns.args);

    if (runPid === 0) {
        ns.tprint("Failed to start run script");
        ns.tail(runPid);
        return;
    } 

    // wait for run script to finish
    while (ns.isRunning(runPid)) {
        await ns.sleep(300);
    }

    ns.tprint("Finished running scripts on all servers");
}
