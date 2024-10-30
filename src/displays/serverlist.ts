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
	ui.tail();

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
		default:
			ns.tprint(`ERROR: Unknown mode ${mode}`);
			break;
	}

	// eslint-disable-next-line no-constant-condition
	while (true) {
		ns.clearLog();
		for (const s of sortedServers) {
			const server = ns.getServer(s);
			const output = formating.getServerDisplayString(server);
			ns.print(output);
		}
		ui.autoSize();
		await ns.sleep(1000);
	}

	function sortByMaxMoney(a: string, b: string): number {
		return ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a);
	}
}
