import { NS } from "@ns";

export class UIHandler {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    private charWidth = 10;
    private lineHeight = 8;

    public getTextWidth(text: string): number {
        const longestLineLength = this.getLongestLine(text.split("\n")).length;
        return longestLineLength * this.charWidth;
    }

    public getHeightForLines(lines: number): number {
        return lines * this.lineHeight;
    }

    getLongestLine(lines: string[]): string {
        return lines.reduce((max, line) => line.length > max.length ? line : max, "");
    }

    public tail(): void {
        this.ns.tail();
        const log = this.ns.getScriptLogs()
        const longestLine = this.getLongestLine(log).length;
        this.ns.resizeTail(longestLine * this.charWidth, this.getHeightForLines(log.length));
    }
}