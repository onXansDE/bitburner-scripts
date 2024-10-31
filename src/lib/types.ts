export interface StockInfo {
    symbol: string;
    averagePrice: number;
    askPrice: number;
    bidPrice: number;
    prediction: number;
    volatility: number;
    maxShares: number;
    organization: string;
    position: PositionInfo;
}

export enum StockSort {
    Value = "value",
    Forecast = "forecast",
    ShortForcast = "shortforecast",
    Volatility = "volatility",
    Position = "position"
}

export interface PositionInfo {
    longOwned: number;
    averageLongPrice: number;
    shortOwned: number;
    averageShortPrice: number;
}