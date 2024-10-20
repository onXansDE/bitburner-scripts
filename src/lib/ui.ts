import { NS } from "@ns";

export class UIHandler {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    private charWidth = 10;
    private lineHeight = 8;

    public getTextWidth(text: string): number {
        const longestLineLength = text.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
        return longestLineLength * this.charWidth;
    }

    public getHeightForLines(lines: number): number {
        return lines * this.lineHeight;
    }
}