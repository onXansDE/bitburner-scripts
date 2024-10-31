import { NS } from "@ns";
import { TextFormater } from "/lib/formating";
import { StocksHandler } from "/lib/stocks";
import { PositionInfo, StockInfo, StockSort } from "/lib/types";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();


	const tf = new TextFormater(ns);
	const sth = new StocksHandler(ns);
	const ui = new UIHandler(ns);

	ns.tail();

	// eslint-disable-next-line no-constant-condition
	while (true) {
        const stocks = sth.getStocksSortedBy(StockSort.Position);
		stocks.forEach((stock: StockInfo) => {
            const position = sth.getPositionAnalysis(stock);
            const trend = stock.prediction;
            const reset = "\u001b[0m";
            let color = reset;
            if (trend > 0.5 && trend < 0.75) {
                // ANSI COLOR LIGHT GREEN
                color = "\u001b[92m📈";
            }
            if (trend >= 0.75) {
                // ANSI COLOR GREEN
                color = "\u001b[32m📈";
            }
            if (trend < 0.5 && trend > 0.25) {
                // ANSI COLOR LIGHT RED
                color = "\u001b[91m📉";
            }
            if (trend <= 0.25) {
                // ANSI COLOR RED
                color = "\u001b[31m📉";
            }
            if (position.longValue > 0) {
                ns.print(`${color}${stock.symbol}: LONG: ${tf.formatMoney(stock.position.averageLongPrice * stock.position.longOwned)} / ${tf.formatMoney(position.longValue)} -> ${tf.formatMoney(position.longGain)} (${position.longGainPercentage.toFixed(2)}%)${reset}`);
            }
            if (position.shortValue > 0) {
                ns.print(`${color}${stock.symbol}: SHORT: ${tf.formatMoney(stock.position.averageShortPrice * stock.position.shortOwned)} / ${tf.formatMoney(position.shortValue)} -> ${tf.formatMoney(position.shortGain)} (${position.shortGainPercentage.toFixed(2)}%)${reset}`);
            }
		});

		await ns.stock.nextUpdate();
        ui.autoSize();
		ns.clearLog();
	}
}
