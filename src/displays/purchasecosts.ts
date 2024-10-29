import { NS } from "@ns";
import { ServerHandler } from "/lib/server";
import { TextFormater } from "/lib/formating";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    const sh = new ServerHandler(ns);
    const formating = new TextFormater(ns);
    const ui = new UIHandler(ns);
    
    const ram_check = Array.from({ length: 20 }, (_, i) => 2 ** (i + 1));

    ram_check.forEach((ram) => {
        const cost = ns.getPurchasedServerCost(ram);
        ns.print(`INFO Cost for ${ram}GB: ${formating.formatMoney(cost)}`);
    });

    ui.tail();
}

