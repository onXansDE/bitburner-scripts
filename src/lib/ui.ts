import { NS } from "@ns";
import { ReactDOM } from "./react";

export class UIHandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	private charWidth = 12;
	private lineHeight = 24;

	public getHeightForLines(lines: number): number {
		return lines * this.lineHeight;
	}

	private maxLineLength(lines: string[]): number {
		let longestLine = 0;
		for (let line of lines) {
			// clear trailing whitespace
			line = line.replace(/\s+$/, "");
			if (line.length > longestLine) {
				longestLine = line.length;
			}
		}
		return longestLine;
	}

	public tail(): void {
		this.ns.tail();
	}

	public autoSize() {
		const log = this.ns.getScriptLogs();
		const longestLine = this.maxLineLength(log);
		const width = longestLine * this.charWidth;
		const height = this.getHeightForLines(log.length + 1) + 5;
		this.ns.resizeTail(width, height);
	}
}
