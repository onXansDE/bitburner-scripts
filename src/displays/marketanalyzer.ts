import { NS } from "@ns";
import { TextFormater } from "/lib/formating";
import { StocksHandler } from "/lib/stocks";
import { StockInfo, StockSort } from "/lib/types";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

    const ANALYSIS_LENGTH = 200;
    let Iteration = 0;
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

    const minMaxPrices: { min: number; max: number }[] = [];
    const minMaxForecast: { min: number; max: number }[] = [];
    let forecastHistory: number[][] = [];
    const minMaxVolatility: { min: number; max: number }[] = [];
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const stocks = sth.getStocksSortedBy(sort as StockSort);
		if(minMaxPrices.length !== stocks.length) {
            minMaxPrices.length = stocks.length;
        }
        if(minMaxForecast.length !== stocks.length) {
            minMaxForecast.length = stocks.length;
        }
        if(forecastHistory.length !== stocks.length) {
            forecastHistory = stocks.map(() => []);
        }
        if(minMaxVolatility.length !== stocks.length) {
            minMaxVolatility.length = stocks.length;
        }
        let pricesText = "Stock Prices:\n";
        let forecastText = "Stock Forecast:\n";
        let volatilityText = "Stock Volatility:\n";

        stocks.forEach((stock: StockInfo, index) => {
            const lastPrice = minMaxPrices[index] ?? { min: stock.averagePrice, max: stock.averagePrice };
            if (stock.averagePrice < lastPrice.min) {
                lastPrice.min = stock.averagePrice;
            }
            if (stock.averagePrice > lastPrice.max) {
                lastPrice.max = stock.averagePrice;
            }
            minMaxPrices[index] = lastPrice;
            const lastForecast = minMaxForecast[index] ?? { min: stock.prediction, max: stock.prediction };
            if (stock.prediction < lastForecast.min) {
                lastForecast.min = stock.prediction;
            }
            if (stock.prediction > lastForecast.max) {
                lastForecast.max = stock.prediction;
            }
            minMaxForecast[index] = lastForecast;
            forecastHistory[index].push(stock.prediction);
            if (forecastHistory[index].length > ANALYSIS_LENGTH) {
                forecastHistory[index].shift();
            }
            const lastVolatility = minMaxVolatility[index] ?? { min: stock.volatility, max: stock.volatility };
            if (stock.volatility < lastVolatility.min) {
                lastVolatility.min = stock.volatility;
            }
            if (stock.volatility > lastVolatility.max) {
                lastVolatility.max = stock.volatility;
            }
            minMaxVolatility[index] = lastVolatility;
            pricesText += (`${stock.symbol}: Min: ${tf.formatMoney(lastPrice.min)} | Max: ${tf.formatMoney(lastPrice.max)}\n`);
            forecastText += (`${stock.symbol}: Min: ${lastForecast.min} | Max: ${lastForecast.max} | Avg: ${forecastHistory[index].reduce((a, b) => a + b, 0) / forecastHistory[index].length}\n`);
            volatilityText += (`${stock.symbol}: Min: ${lastVolatility.min} | Max: ${lastVolatility.max}\n`);
        });
        ns.write("stockprices.txt", pricesText, "w");
        ns.write("stockforecast.txt", forecastText, "w");
        ns.write("stockvolatility.txt", volatilityText, "w");
        ns.print(pricesText);
        ns.print(`Iteration: ${Iteration} / ${ANALYSIS_LENGTH}`);
        Iteration++;
		await ns.stock.nextUpdate();
		ui.autoSize();
		ns.clearLog();
	}
}
