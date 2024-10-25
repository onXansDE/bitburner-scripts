import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
    const target = String(ns.args[0]);
    if (target === "undefined") {
        ns.tprintRaw("ERROR Usage: run hack.ts <target>");
        ns.exit();
    }

    while (true) {
        const amount = await ns.hack(target);
        if (amount === 0) {
            ns.print(`ERROR Failed to hack ${target}`);
        } else {
            ns.print(`SUCCESS Hacked ${target} for ${amount}`);
        }
    }
}