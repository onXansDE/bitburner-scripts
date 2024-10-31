import { NS } from "@ns";
import { TextFormater } from "/lib/formating";
import { BotnetHandler } from "/lib/botnet";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    const scriptName = ns.getScriptName();
    const bn = new BotnetHandler(ns);
    const formating = new TextFormater(ns);
    
    const amount = Number(ns.args[0]);
    const ram = Number(ns.args[1]);
    if(isNaN(amount) || isNaN(ram)) {
        ns.tprint(`ERROR Usage: run ${scriptName} <amount> <ram>`);
        ns.exit();
    }
    ns.tprint(`INFO Creating ${amount} servers with ${ram}GB of RAM`);

    const singleCost = ns.getPurchasedServerCost(ram);
    const totalCost = singleCost * amount;
    
    if(totalCost > ns.getPlayer().money * 0.1) {
        ns.tprint(`ERROR Total cost of ${formating.formatMoney(totalCost)} is more than 10% of your money`);
        const decicion = await ns.prompt(`Do you want to continue?`);
        if(decicion === false) {
            ns.exit();
        }
    }

    ns.tprint(`INFO Creating ${amount} servers with ${ram}GB of RAM`);
    const servers = bn.createBotnetServers(amount, ram);
    ns.tprint(`INFO Created ${servers.length} servers`);
}

