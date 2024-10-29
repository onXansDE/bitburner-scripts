import { TextFormater } from "../lib/formating";
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	let interval = Number(ns.args[0]);
	if (isNaN(interval)) {
		interval = 1;
	}
	const tf = new TextFormater(ns);
	ns.tail();
	let player = ns.getPlayer();
	const moneyHistory = [player.money];
	// eslint-disable-next-line no-constant-condition
	while (true) {
		player = ns.getPlayer();
		moneyHistory.push(player.money);
		ns.print(
			`Money: ${tf.formatMoney(player.money)} ${tf.getTrendFormated(
				moneyHistory
			)}`
		);
		if (moneyHistory.length > 200) {
			moneyHistory.shift();
		}
		ns.print(` `);
		await ns.sleep(interval * 1000);
		ns.clearLog();
	}
}
