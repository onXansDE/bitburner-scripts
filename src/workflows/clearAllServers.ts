import { NS } from "@ns";
import { ServerHandler } from "/lib/server";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();
	const sh = new ServerHandler(ns);

	const servers = sh.getRootServers();
	ns.print(`INFO Clearing all servers`);

	for (const server of servers) {
		sh.killAllProcesses(server);
		sh.whipeDrive(server);
		!sh.isCleanServer(server)
			? ns.print(`SUCCESS Cleaned ${server}`)
			: ns.print(`ERROR Failed to clean server ${server}`);
	}
}
