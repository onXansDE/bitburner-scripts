import { NS, ProcessInfo } from "@ns";
import { TextFormater } from "/lib/formating";
import { FileHandler } from "/lib/files";
import { ServerHandler } from "/lib/server";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    let interval = Number(ns.args[0]);
    if (isNaN(interval)) {
        interval = 1;
    }

    const tf = new TextFormater(ns);
    const ui = new UIHandler(ns);
    ui.tail();

    let player = ns.getPlayer();

    const moneyHistory = [player.money];
    let windowResiszed = false;
    
    do {
        player = ns.getPlayer();
        moneyHistory.push(player.money);
        const trend = tf.getTrendFormated(moneyHistory);
        ns.print(`Money: ${tf.formatMoney(player.money)} ${tf.formatMoney(trend.diff)} ${trend.trend}`);
        ns.print(`Playtime: ${ns.tFormat(player.totalPlaytime)} | City: ${player.city}`);
        await ns.sleep(interval * 1000);
        if (!windowResiszed) {
            ui.autoSize();
            windowResiszed = true;
        }
        ns.clearLog();
        // eslint-disable-next-line no-constant-condition
    } while (true);
}