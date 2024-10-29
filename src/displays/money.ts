import { NS } from "@ns";
import { DisplayPreset, TextFormater } from "/lib/formating";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    let interval = Number(ns.args[0]);
    if (isNaN(interval)) {
        interval = 1;
    }

    const tf = new TextFormater(ns);

    ns.tail()

    let player = ns.getPlayer();

    const moneyHistory = [player.money];

    while (true) {
        player = ns.getPlayer();
        moneyHistory.push(player.money);
        ns.print(`Money: ${tf.formatMoney(player.money)} ${tf.getTrendFormated(moneyHistory)}`);
        ns.print(``);
        await ns.sleep(interval * 1000);
        ns.clearLog();
    }
}