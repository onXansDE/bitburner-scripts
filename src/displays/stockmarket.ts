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

	ns.tail();

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const stocks = sth.getStocksSortedBy(sort as StockSort);
		stocks.forEach((stock: StockInfo) => {
			ns.print(`${stock.symbol}: ${stock.prediction > 0.5 ? "📈" : "📉"}: ${stock.prediction.toFixed(3)} ⚡${(stock.volatility * 100).toFixed(2)}`);
		});

		await ns.stock.nextUpdate();
		ns.print("Waiting for next update...");
		ui.autoSize();
		ns.clearLog();
	}
}
