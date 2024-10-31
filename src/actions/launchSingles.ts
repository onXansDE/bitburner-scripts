import { NS } from "@ns";
import { ServerHandler } from "/lib/server";
import { FileHandler } from "/lib/files";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.tail();
	const scriptName = ns.getScriptName();
	const target = String(ns.args[0]);
	if (target === "undefined") {
		ns.tprint("Usage: run " + scriptName + " <target> [attackers=all]");
		ns.exit();
	}

	const scriptname = ns.getScriptName();

	if (target === "undefined") {
		ns.tprintRaw("Usage: " + scriptname + " <target>");
		ns.exit();
	}

	const sh = new ServerHandler(ns);
	const fh = new FileHandler(ns);

	const hackScriptRam = fh.getScriptMemory("attacks/singles/hack.js");
	const weakenScriptRam = fh.getScriptMemory("attacks/singles/weaken.js");
	const growScriptRam = fh.getScriptMemory("attacks/singles/grow.js");
	ns.tprint(
		`INFO: Hack: ${hackScriptRam} | Weaken: ${weakenScriptRam} | Grow: ${growScriptRam}`
	);

	const parts = [1, 3, 13];
	const totalParts = parts.reduce((a, b) => a + b, 0);
	ns.tprint(`INFO: Parts: ${parts.join(" | ")} | Total: ${totalParts}`);

	const hackP = parts[0] / totalParts;
	const weakenP = parts[1] / totalParts;
	const growthP = parts[2] / totalParts;
	ns.tprint(
		`INFO: Hack: ${(hackP * 100).toFixed(2)} | Weaken: ${(
			weakenP * 100
		).toFixed(2)} | Grow: ${(growthP * 100).toFixed(2)}`
	);

	const servers = sh.getServers(sh.getRootServers());

	ns.tprint(`INFO: Found ${servers.length} servers`);
	const random = Math.random();

	servers.forEach(async (server) => {
		ns.print(`INFO: Launching singles attack on ${server.hostname}`);
		const freeRam = server.maxRam;

		sh.killAllProcesses(server.hostname);
		sh.whipeDrive(server.hostname);

		const { hackThreads, weakenThreads, growthThreads } =
			computeThreadAllocations(freeRam);

		if (hackThreads === 0 && weakenThreads === 0 && growthThreads === 0) {
			ns.tprint(`ERROR: Not enough ram on ${server.hostname}`);
			return;
		}

		fh.pushToServer(server, [
			"attacks/singles/hack.js",
			"attacks/singles/weaken.js",
			"attacks/singles/grow.js",
		]);

		if (weakenThreads !== 0) {
			const proc = fh.runScript(
				server.hostname,
				"attacks/singles/weaken.js",
				weakenThreads,
				target
			);
			if (proc === null) {
				ns.print(`ERROR: Failed to launch weaken on ${server.hostname}`);
			}
		}
		
		if (growthThreads !== 0) {
			const proc = fh.runScript(
				server.hostname,
				"attacks/singles/grow.js",
				growthThreads,
				target
			);
			if (proc === null) {
				ns.print(`ERROR: Failed to launch grow on ${server.hostname}`);
			}
		}
		if (hackThreads !== 0) {
			const proc = fh.runScript(
				server.hostname,
				"attacks/singles/hack.js",
				hackThreads,
				target
			);
			if (proc === null) {
				ns.print(`ERROR: Failed to launch hack on ${server.hostname}`);
			}
		}
		await ns.asleep(random % 1000);
	});

	// print statistics
	// servers
	servers.forEach((server) => {
		const { hackThreads, weakenThreads, growthThreads } =
			computeThreadAllocations(server.maxRam);
		ns.print(
			`INFO: ${server.hostname} | Hack: ${hackThreads} | Weaken: ${weakenThreads} | Grow: ${growthThreads}`
		);
	});

	function computeThreadAllocations(freeRam: number) {
		const hackRamAvailable = Math.floor(freeRam * hackP);
		const weakenRamAvailable = Math.floor(freeRam * weakenP);
		const growthRamAvailable = Math.floor(freeRam * growthP);

		const hackThreads = Math.floor(hackRamAvailable / hackScriptRam);
		const weakenThreads = Math.floor(weakenRamAvailable / weakenScriptRam);
		const growthThreads = Math.floor(growthRamAvailable / growScriptRam);
		return { hackThreads, weakenThreads, growthThreads };
	}
}
