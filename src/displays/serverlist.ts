import { NS } from "@ns";
import { ServerHandler } from "/lib/server";
import { DisplayPreset, TextFormater } from "/lib/formating";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

	const sh = new ServerHandler(ns);
	const formating = new TextFormater(ns);
	const ui = new UIHandler(ns);
	ui.tail();

	const servers = sh.getExternalServers();

	const mode = await ns.prompt("Choose mode a display mode:", { type: "select", choices: ["maxmoney", "targetfinder"] });
	let sortedServers = servers;
	switch (mode) {
		case "maxmoney":
			sortedServers = servers.sort(sortByMaxMoney);
			break;
		case "targetfinder":
			sortedServers = servers.filter((s) => ns.hasRootAccess(s) && ns.getServerMaxMoney(s) > 0).sort(sortByMaxMoney);
			break;
		default:
			ns.tprint(`ERROR: Unknown mode ${mode}`);
			break;
	}

	let infos = formating.getDefaultDisplay();
	if(mode === "targetfinder") {
		infos = [
			DisplayPreset.MONEY_PERCENT,
			DisplayPreset.DIFFICULTY_PERCENT,
			DisplayPreset.HACK_DIFFICULTY
		]
	}

	// eslint-disable-next-line no-constant-condition
	while (true) {
		ns.clearLog();
		
		for (const s of sortedServers) {
			const server = ns.getServer(s);
			const output = formating.getServerDisplayString(server, infos);
			ns.print(output);
		}
		ui.autoSize(infos.length * 4 * ui.getCharWidth());
		await ns.sleep(1000);
	}

	function sortByMaxMoney(a: string, b: string): number {
		return ns.getServerMaxMoney(a) - ns.getServerMaxMoney(b);
	}
}
