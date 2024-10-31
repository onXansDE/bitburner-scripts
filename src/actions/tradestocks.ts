import { NS } from "@ns";
import { StocksHandler } from "/lib/stocks";
import { StockSort } from "/lib/types";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();
    
    
	const sth = new StocksHandler(ns);

    // eslint-disable-next-line no-constant-condition
    while(true) {
        const stocks = sth.getStocksSortedBy(StockSort.Owned);
        stocks.forEach((stock) => {
            const pos = sth.getPositionAnalysis(stock);
            if(pos.longGainPercentage > 50 && stock.prediction < 0.5) {
                ns.stock.sellStock(stock.symbol, stock.position.longOwned);
            }
        });
    }
}
