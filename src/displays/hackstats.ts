import { NS } from "@ns";
import { DisplayPreset, TextFormater } from "/lib/formating";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const tf = new TextFormater(ns);

    const servername = (await ns.prompt("Server to track", {type: "text"})).toString();

    if (!ns.serverExists(servername)) {
        ns.tprint("No valid server provided");
        return;
    }

    let server = ns.getServer(servername);
    if (server.purchasedByPlayer) {
        ns.tprint(`Server ${servername} cant be tracked because it is owned by the player`);
        return;
    }
    
    const ui = new UIHandler(ns);
    ui.tail();

    const moneyHistory = [server.moneyAvailable ?? 0];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        server = ns.getServer(servername);
        moneyHistory.push(server.moneyAvailable ?? 0);
        ns.print(`Server: ${servername} (${server.ip}, ${server.organizationName})`);
        const growTime = ns.getGrowTime(servername);
        const hackTime = ns.getHackTime(servername);
        const weakenTime = ns.getWeakenTime(servername);
        ns.print(`Grow Time: ${ns.tFormat(growTime)}\nHack Time: ${ns.tFormat(hackTime)}\nWeaken Time: ${ns.tFormat(weakenTime)}`);
        ns.print(`Security: ${tf.getFormatedInfo(server, DisplayPreset.DIFFICULTY_PERCENT)}`);
        ns.print(`Money: ${tf.getFormatedInfo(server, DisplayPreset.MONEY_FULL_PERCENT)} ${tf.formatMoney(tf.getTrendFormated(moneyHistory).diff)}`);
        ns.print(``);
        if (moneyHistory.length > 200) {
            moneyHistory.shift();
        }
        await ns.sleep(1000 * 10);
        ns.clearLog();
    }
}