import { NS } from "@ns";
import { TextFormater } from "/lib/formating";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

	const tf = new TextFormater(ns);

	ns.tail();
	const symobls = ns.stock.getSymbols();

	const priceHistory: number[][] = Array.from(
		{ length: symobls.length },
		() => []
	);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		symobls.forEach((symbol, index) => {
			const position = ns.stock.getPosition(symbol);
			const comapany = ns.stock.getOrganization(symbol);
			const sharePrice = ns.stock.getPrice(symbol);
			const totalShares = ns.stock.getMaxShares(symbol);
			const value = sharePrice * totalShares;
			priceHistory[index].push(value);
			if (priceHistory[index].length > 10) {
				priceHistory[index].shift();
			}
			ns.print(
				`Stock: ${symbol} | ${comapany} (${tf.formatMoney(value)}) -> ${
					position[0]
				} $${tf.formatMoney(position[1] * position[0])}`
			);
		});
		await ns.stock.nextUpdate();
		ns.print("Waiting for next update...");
		ns.clearLog();
	}
}
