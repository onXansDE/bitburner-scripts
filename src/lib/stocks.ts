import { NS } from "@ns";
import { PositionInfo, StockInfo, StockSort } from "./types";

export class StocksHandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

    private getSymbols(): string[] {
        return this.ns.stock.getSymbols();
    }

    private getAveragePrice(symbol: string): number {
        return this.ns.stock.getPrice(symbol);
    }

    private getAskPrice(symbol: string): number {
        return this.ns.stock.getAskPrice(symbol);
    }

    private getBidPrice(symbol: string): number {
        return this.ns.stock.getBidPrice(symbol);
    }

    private getPrediction(symbol: string): number {
        return this.ns.stock.getForecast(symbol);
    }

    private getVolatility(symbol: string): number {
        return this.ns.stock.getVolatility(symbol);
    }

    private getMaxShares(symbol: string): number {
        return this.ns.stock.getMaxShares(symbol);
    }

    private getOrganization(symbol: string): string {
        return this.ns.stock.getOrganization(symbol);
    }

    public getPosition(symbol: string) {
        const pos = this.ns.stock.getPosition(symbol);
        return {
            longOwned: pos[0],
            averageLongPrice: pos[1],
            shortOwned: pos[2],
            averageShortPrice: pos[3]
        } as PositionInfo;
    }

    public getStockInfo(symbol: string) {
        return {
            symbol,
            averagePrice: this.getAveragePrice(symbol),
            askPrice: this.getAskPrice(symbol),
            bidPrice: this.getBidPrice(symbol),
            prediction: this.getPrediction(symbol),
            volatility: this.getVolatility(symbol),
            maxShares: this.getMaxShares(symbol),
            organization: this.getOrganization(symbol),
            position: this.getPosition(symbol)
        } as StockInfo;
    }

    private getStocksByForecast(short: boolean) {
        const symbols = this.getSymbols();
        const stocks = symbols.map(symbol => this.getStockInfo(symbol));
        return short ? stocks.sort((a, b) => a.prediction - b.prediction) : stocks.sort((a, b) => b.prediction - a.prediction);
    }

    private getStocksByValue() {
        const symbols = this.getSymbols();
        const stocks = symbols.map(symbol => this.getStockInfo(symbol));
        return stocks.sort((a, b) => a.averagePrice - b.averagePrice);
    }

    private getStocksByVolatility() {
        const symbols = this.getSymbols();
        const stocks = symbols.map(symbol => this.getStockInfo(symbol));
        return stocks.sort((a, b) => a.volatility - b.volatility);
    }

    private getStocksByPosition() {
        const symbols = this.getSymbols();
        const stocks = symbols.map(symbol => this.getStockInfo(symbol));
        return stocks.sort((b, a) => (a.position.longOwned * a.averagePrice) - (b.position.longOwned * b.averagePrice) + (a.position.shortOwned * a.averagePrice) - (b.position.shortOwned * b.averagePrice));
    }

    public getStocksSortedBy(sort: StockSort) {
        switch (sort) {
            case "value":
                return this.getStocksByValue();
            case "forecast":
                return this.getStocksByForecast(false);
            case "shortforecast":
                return this.getStocksByForecast(true);
            case "volatility":
                return this.getStocksByVolatility();
            case "position":
                return this.getStocksByPosition();
            default:
                return [];
        }
    }

    public getPositionAnalysis(stock: StockInfo) {
        const longValue = stock.position.longOwned * stock.bidPrice;
        const longGain = stock.position.longOwned * (stock.bidPrice - stock.position.averageLongPrice);
        const shortValue = stock.position.shortOwned * stock.askPrice;
        const shortGain = stock.position.shortOwned * (stock.position.averageShortPrice - stock.askPrice);
        return {
            longValue,
            longGain,
            longGainPercentage: (longGain / longValue) * 100,
            shortValue,
            shortGain,
            shortGainPercentage: (shortGain / shortValue) * 100
        };
    }
}
