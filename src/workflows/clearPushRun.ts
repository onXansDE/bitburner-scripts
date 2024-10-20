import { NS } from "@ns";
import { FileHandler } from "/lib/files";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    let servername = ns.getHostname();
    const files = new FileHandler(ns);
    
    const scriptNames = ["clearAllServers", "pushToAll", "execOnAll"];

    // usage: run clearPushRun <scriptName> [...args]
    if (ns.args.length < 1) {
        ns.tprint(`ERROR Usage: run ${scriptName} <scriptName> [...args]`);
        return;
    }

    const targetScriptName = String(ns.args[0]);
    const targetScriptArgs = ns.args.slice(1).map(arg => String(arg));

    if(!ns.fileExists(targetScriptName)) {
        ns.tprint(`ERROR Script ${targetScriptName} does not exist`);
        return;
    }

    for(let i = 0; i < scriptNames.length; i++) {
        scriptNames[i] = `workflows/${scriptNames[i]}.js`;
        
        if(!ns.fileExists(scriptNames[i])) {
            ns.tprint(`ERROR Workflow ${scriptNames[i]} does not exist`);
            ns.tprint(`ERROR Verify that the file exists in the workflows directory`);
            ns.exit();
        }
    }

    ns.tprint(`INFO Clearing all servers`);
    await files.watchScript(servername, scriptNames[0], 1)
    ns.tprint(`INFO Installing ${targetScriptName} on all servers`);
    await files.watchScript(servername, scriptNames[1], 1, targetScriptName)
    ns.tprint(`INFO Running ${targetScriptName} on all servers`);
    await files.watchScript(servername, scriptNames[2], 1, targetScriptName, ...targetScriptArgs)
}
