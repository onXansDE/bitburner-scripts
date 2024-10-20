import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");

	var target = String(ns.args[0]);
	var hostname = ns.getHostname();

	if (target === "undefined") {
		ns.tprintRaw("Usage: run simplehack.ts <target>");
		ns.exit();
	}

	var moneyThresh = ns.getServerMaxMoney(target) * 0.75;

	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

	while (true) {
		var currentSecurity = ns.getServerSecurityLevel(target);
		var currentMoney = ns.getServerMoneyAvailable(target);
		if (currentSecurity > securityThresh) {
			ns.printf(
				`Server %s security too high. (%s/%s). Weakening...`,
				target,
				currentSecurity,
				securityThresh
			);
			var result = await ns.weaken(target);
      ns.print(`Weakened ${target} by ${result}`);
		} else if (currentMoney < moneyThresh) {
			ns.printf(
				`Server %s money too low. (%s/%s). Growing...`,
				target,
				currentMoney,
				moneyThresh
			);
      var result = await ns.grow(target);
      ns.print(`Grew ${target} by ${result}`);
		} else {
			var money = await ns.hack(target);
			if (money === 0) {
				ns.printf(`Server %s failed to hack %s`, hostname, target);
			} else {
				ns.printf(
					`Server %s hacked %s for %s`,
					hostname,
					target,
					money
				);
			}
		}
	}
}
