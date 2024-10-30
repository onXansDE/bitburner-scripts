import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");

	const target = String(ns.args[0]);
	const hostname = ns.getHostname();

	if (target === "undefined") {
		ns.tprintRaw("Usage: run simplehack.ts <target>");
		ns.exit();
	}

	const moneyThresh = ns.getServerMaxMoney(target) * 0.75;

	const securityThresh = ns.getServerMinSecurityLevel(target) + 5;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const currentSecurity = ns.getServerSecurityLevel(target);
		const currentMoney = ns.getServerMoneyAvailable(target);
		if (currentSecurity > securityThresh) {
			ns.printf(
				`Server %s security too high. (%s/%s). Weakening...`,
				target,
				currentSecurity,
				securityThresh
			);
			const result = await ns.weaken(target);
			ns.print(`Weakened ${target} by ${result}`);
		} else if (currentMoney < moneyThresh) {
			ns.printf(
				`Server %s money too low. (%s/%s). Growing...`,
				target,
				currentMoney,
				moneyThresh
			);
			const result = await ns.grow(target);
			ns.print(`Grew ${target} by ${result}`);
		} else {
			const money = await ns.hack(target);
			if (money === 0) {
				ns.printf(`Server %s failed to hack %s`, hostname, target);
			} else {
				ns.printf(`Server %s hacked %s for %s`, hostname, target, money);
			}
		}
	}
}
