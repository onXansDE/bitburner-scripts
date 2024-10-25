import { NS } from "@ns";
import { TextFormater } from "/lib/formating";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
    const target = String(ns.args[0]);
    if (target === "undefined") {
        ns.tprintRaw("ERROR Usage: run hack.ts <target>");
        ns.exit();
    }

    while (true) {
        const amount = await ns.grow(target);
        if (amount === 0) {
            ns.print(`ERROR Failed to grow ${target}`);
        } else {
            ns.print(`SUCCESS Grew ${target} by ${(amount * 100).toFixed(2)}%`);
        }
    }
}
