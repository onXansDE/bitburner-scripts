import { NS } from "@ns";
import { ServerHandler } from "/lib/server";
import { FileHandler } from "/lib/files";
import { TextFormater } from "/lib/formating";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
    const scriptName = ns.getScriptName();
	var target = String(ns.args[0]);
    if (target === "undefined") {
        ns.tprint("Usage: run " + scriptName + " <target> [attackers=all]");
        ns.exit();
    }
    ns.tprint(`INFO: Launching singles attack on ${target}`);
    var attackers = ns.args.slice(1).map(String);
    if (ns.args.length === 1) {
        ns.print(`WARN: No attackers specified, using all`);
        attackers = ["all"];
    }

    var scriptname = ns.getScriptName();

	if (target === "undefined") {
		ns.tprintRaw("Usage: " + scriptname + " <target>");
		ns.exit();
	}
    const sh = new ServerHandler(ns);
    const fh = new FileHandler(ns);

    const hackScriptRam = fh.getScriptMemory("attacks/singles/hack.js");
    const weakenScriptRam = fh.getScriptMemory("attacks/singles/weaken.js");
    const growScriptRam = fh.getScriptMemory("attacks/singles/grow.js");
    ns.tprint(`INFO: Hack: ${hackScriptRam} | Weaken: ${weakenScriptRam} | Grow: ${growScriptRam}`);

    const parts = [1, 10, 3];
    const totalParts = parts.reduce((a, b) => a + b, 0);
    ns.tprint(`INFO: Parts: ${parts.join(" | ")} | Total: ${totalParts}`);

    const hackP = parts[0] / totalParts;
    const weakenP = parts[1] / totalParts;
    const growthP = parts[2] / totalParts;
    ns.tprint(`INFO: Hack: ${(hackP * 100).toFixed(2)} | Weaken: ${(weakenP * 100).toFixed(2)} | Grow: ${(growthP * 100).toFixed(2)}`);
    
    var servers = sh.getServers(sh.findServers(attackers));
    ns.print(`INFO: Found ${servers.length} servers`);
    servers.forEach((server) => {
        const freeRam = server.maxRam - server.ramUsed;
        

        const hackRamAvailable = Math.floor(freeRam * hackP);
        const weakenRamAvailable = Math.floor(freeRam * weakenP);
        const growthRamAvailable = Math.floor(freeRam * growthP);
        
        const hackThreads = Math.floor(hackRamAvailable / hackScriptRam);
        const weakenThreads = Math.floor(weakenRamAvailable / weakenScriptRam);
        const growthThreads = Math.floor(growthRamAvailable / growScriptRam);

        if (hackThreads === 0 && weakenThreads === 0 && growthThreads === 0) {
            ns.print(`ERROR: Not enough RAM on ${server.hostname}`);
            return;
        }

        fh.pushToServer(server, ["attacks/singles/hack.js", "attacks/singles/weaken.js", "attacks/singles/grow.js"]);
        
        if (hackThreads !== 0 ) {
            const proc = fh.runScript(server.hostname, "attacks/singles/hack.js", hackThreads, target);
            if (proc === null) {
                ns.tprint(`ERROR: Failed to launch hack on ${server.hostname}`);
                return;
            }
        }
        if (weakenThreads !== 0) {
            const proc = fh.runScript(server.hostname, "attacks/singles/weaken.js", weakenThreads, target);
            if (proc === null) {
                ns.tprint(`ERROR: Failed to launch weaken on ${server.hostname}`);
                return;
            }
        }

        if (growthThreads !== 0) {
            const proc = fh.runScript(server.hostname, "attacks/singles/grow.js", growthThreads, target);
            if (proc === null) {
                ns.tprint(`ERROR: Failed to launch grow on ${server.hostname}`);
                return;
            }
        }
        ns.tprint(`SUCCESS: Launched singles attack on ${server.hostname} (${hackThreads} | ${weakenThreads} | ${growthThreads})`);
    });
}