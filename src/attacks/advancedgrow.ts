import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
    const target = String(ns.args[0]);
    if (target === "undefined") {
        ns.tprintRaw("ERROR Usage: run grow.ts <target>");
        ns.exit();
    }
    let condition: "5" | "maxout" | "infinite" = "infinite";
    const userInputCondition = ns.args[1];
    if (userInputCondition !== "undefined") {
        if (userInputCondition === "5" || userInputCondition === "maxout" || userInputCondition === "infinite") {
            condition = userInputCondition;
        }
    }
    let iterations = 0;
    
    function checkCondition() {
        switch (condition) {
            case "5":
                return iterations < 5;
            case "maxout":
                return ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target);
            case "infinite":
                return true;
            default:
                return true;
        }
    }
    while (checkCondition()) {
        ns.print(`INFO Growing ${target} takes ${ns.tFormat(ns.getGrowTime(target))} seconds`);
        const amount = await ns.grow(target);
        if (amount === 0) {
            ns.print(`ERROR Failed to grow ${target}`);
        } else {
            ns.print(`SUCCESS Grew ${target} by ${(amount * 100).toFixed(2)}%`);
        }
        const waitTime = Math.floor(Math.random());
        ns.print(`INFO Waiting ${(waitTime * 100).toFixed(2)} seconds before next grow`);
        await ns.sleep(waitTime * 100);
        iterations--;
    }
}
