import { NS } from "@ns";
import { ReactDOM } from "./react";

export class UIHandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	private charWidth = 12;
	public getCharWidth(): number {
		return this.charWidth;
	}
	private lineHeight = 24;
	public getLineHeight(): number {
		return this.lineHeight;
	}

	public getHeightForLines(lines: number): number {
		return lines * this.lineHeight;
	}

	private maxLineLength(lines: string[]): number {
		let longestLine = 0;
		for (const line of lines) {
			const split = line.split("\n");
			for (const l of split) {
				if (l.length > longestLine) {
					longestLine = l.length;
				}
			}
		}
		return longestLine;
	}

	public tail(): void {
		this.ns.tail();
	}

	public autoSize(extraWidth = 0, extraHeight = 0): void {
		const log = this.ns.getScriptLogs();
		const longestLine = this.maxLineLength(log);
		const width = longestLine * this.charWidth;
		const lineCount = log.map((l) => l.split("\n").length).reduce((a, b) => a + b, 0);
		const height = this.getHeightForLines(lineCount + 1) + 5;
		this.ns.resizeTail(Math.min(width, window.innerWidth - 20) + extraWidth, Math.min(height, window.innerHeight - 20) + extraHeight);
	}
}
