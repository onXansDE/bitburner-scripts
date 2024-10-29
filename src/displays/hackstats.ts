import { NS } from "@ns";
import { DisplayPreset, TextFormater } from "/lib/formating";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const tf = new TextFormater(ns);

    const servername = String(ns.args[0]);

    if (ns.args.length !== 1 || !ns.serverExists(servername)) {
        ns.tprint("No valid server provided");
        return;
    }

    let server = ns.getServer(servername);
    if (server.purchasedByPlayer) {
        ns.tprint(`Server ${servername} cant be tracked because it is owned by the player`);
        return;
    }
    
    ns.tail()

    const moneyHistory = [server.moneyAvailable ?? 0];

    while (true) {
        server = ns.getServer(servername);
        moneyHistory.push(server.moneyAvailable ?? 0);
        ns.print(`Server: ${servername} (${server.ip}, ${server.organizationName})`);
        ns.print(`Security: ${tf.getFormatedInfo(server, DisplayPreset.DIFFICULTY_PERCENT)}`);
        ns.print(`Money: ${tf.getFormatedInfo(server, DisplayPreset.MONEY_FULL_PERCENT)} ${tf.getTrendFormated(moneyHistory)}`);
        ns.print(``);
        await ns.sleep(1000 * 10);
        if (moneyHistory.length > 200) {
            moneyHistory.shift();
        }
        ns.clearLog();
    }
}