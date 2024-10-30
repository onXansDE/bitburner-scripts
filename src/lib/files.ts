import { NS, Server } from "@ns";

export class FileHandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	public getScriptMemory(script: string): number {
		return this.ns.getScriptRam(script, "home");
	}

	public pushToServer(
		server: Server | string,
		scripts: string[] | string
	): boolean {
		const serverName = typeof server === "string" ? server : server.hostname;
		return this.ns.scp(scripts, serverName);
	}

	public searchFiles(files: string[], server = "home"): string[] {
		return files.filter((file) => this.ns.fileExists(file, server));
	}

	public calculatePossibleThreads(
		server: Server | string,
		scriptMemory: number
	) {
		if (typeof server === "string") {
			return this.calcPossibleThreads(
				this.ns.getServerMaxRam(server),
				this.ns.getServerUsedRam(server),
				scriptMemory
			);
		}
		return Math.floor(
			(server.maxRam - this.ns.getServerUsedRam(server.hostname)) / scriptMemory
		);
	}

	calcPossibleThreads(
		maxRam: number,
		usedRam: number,
		scriptRam: number
	): number {
		return Math.floor((maxRam - usedRam) / scriptRam);
	}

	public canRunScript(server: Server | string, scriptMemory: number): boolean {
		return this.calculatePossibleThreads(server, scriptMemory) > 0;
	}

	public runScript(
		server: string,
		script: string,
		threads = 1,
		...args: string[]
	): number {
		const pid = this.ns.exec(script, server, threads, ...args);
		return pid;
	}

	public async watchScript(
		server: string,
		script: string,
		threads = 1,
		...args: string[]
	): Promise<boolean> {
		const pid = this.runScript(server, script, threads, ...args);
		if (pid === 0) {
			return false;
		}
		while (this.ns.isRunning(pid)) {
			await this.ns.sleep(500);
		}
		return true;
	}
}
