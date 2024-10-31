import { NS } from "@ns";
import { TextFormater } from "/lib/formating";
import { StocksHandler } from "/lib/stocks";
import { StockInfo, StockSort } from "/lib/types";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

	const sortChoices: StockSort[] = Object.values(StockSort);
	const sort = await ns.prompt("Sort by", { type: "select",choices: sortChoices });

	if (!sortChoices.includes(sort as StockSort)) {
		ns.tprint(`Invalid sort option: ${sort}`);
		return;
	}


	const sth = new StocksHandler(ns);
	const ui = new UIHandler(ns);
	const tf = new TextFormater(ns);

	ns.tail();

	let priceHistory: number[][] = [];
	let priceStart: number[] = [];
	let Iteration = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const stocks = sth.getStocksSortedBy(sort as StockSort);
		if(priceHistory.length !== stocks.length) {
			priceHistory = stocks.map(() => []);
			priceStart = stocks.map((stock) => stock.averagePrice);
		}
		stocks.forEach((stock: StockInfo, index) => {
			const price5TicksAgo = priceHistory[index][priceHistory[index].length - 5] ?? priceStart[index];
			const price50TickAgo = priceHistory[index][priceHistory[index].length - 50] ?? priceStart[index];
			const price200TickAgo = priceHistory[index][priceHistory[index].length - 200] ?? priceStart[index];
			const startPrice = priceStart[index];
			priceHistory[index].push(stock.averagePrice);
			if(priceHistory[index].length > 1000) {
				priceHistory[index].shift();
			}
			const diffrences = `(${tf.formatMoney(stock.averagePrice - price5TicksAgo)} | ${tf.formatMoney(stock.averagePrice - price50TickAgo)} | ${tf.formatMoney(stock.averagePrice - price200TickAgo)} | Start: ${tf.formatMoney(stock.averagePrice - startPrice)})`;
			ns.print(`${stock.symbol}(${stock.organization}): ${stock.prediction > 0.5 ? "📈" : "📉"}: ${stock.prediction.toFixed(3)} ⚡${(stock.volatility * 100).toFixed(2)} Price: ${tf.formatMoney(stock.averagePrice)} ${diffrences}`);
		});
		ns.print(`Iteration: ${Iteration}`);
		Iteration++;
		await ns.stock.nextUpdate();
		ui.autoSize();
		ns.clearLog();
	}
}
