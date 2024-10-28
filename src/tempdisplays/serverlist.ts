import { NS } from "@ns";
import { ServerHandler } from "/lib/server";
import { TextFormater } from "/lib/formating";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();
	const sh = new ServerHandler(ns);
	const formating = new TextFormater(ns);
	const ui = new UIHandler(ns);

	const servers = sh.getAllServers();

	let mode = String(ns.args[0]);
	if (ns.args.length === 0) {
		mode = "maxmoney";
	}

	let sortedServers = servers;
	switch (mode) {
		case "maxmoney":
			sortedServers = servers.sort(sortByMaxMoney);
			break;
		case "tree":
			ns.tprint(`ERROR: Displaying servers in tree mode.`);
			break;
		default:
			ns.tprint(`ERROR: Unknown mode ${mode}`);
			break;
	}

	let longestLine = "";
	for (const s of sortedServers) {
		const server = ns.getServer(s);
		const indent = 0; // mode === "tree" ? sh.getDistanceToServer(server.hostname) : 0;
		const output =
			"    ".repeat(indent) + formating.getServerDisplayString(server);
		longestLine = output.length > longestLine.length ? output : longestLine;
		ns.print(output);
	}

	ns.tail();
	ns.resizeTail(
		ui.getTextWidth(longestLine),
		ui.getHeightForLines(sortedServers.length)
	);

	function sortByMaxMoney(a: string, b: string): number {
		return ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a);
	}
}
