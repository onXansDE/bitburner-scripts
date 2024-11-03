import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
    const target = String(ns.args[0]);
    if (target === "undefined") {
        ns.tprintRaw("ERROR Usage: run grow.ts <target>");
        ns.exit();
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const amount = await ns.grow(target);
        if (amount === 0) {
            ns.print(`ERROR Failed to hack ${target}`);
        } else {
            ns.print(`SUCCESS Hacked ${target} for ${amount}`);
        }
        // generate a random number between 1 and 5
        const waitTime = Math.floor(Math.random() * 5) + 1;
        await ns.sleep(waitTime * 1000);
    }
}