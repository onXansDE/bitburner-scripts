import { NS } from "@ns";

export class BotnetHandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	public createServer(server: string, ram: number): string {
		return this.ns.purchaseServer(server, ram);
	}

	public createServers(servers: { name: string; ram: number }[]): string[] {
		return servers.map((server) => this.createServer(server.name, server.ram));
	}

	public createServersWithPrefix(
		prefix: string,
		count: number,
		ram: number,
		startindex = 0
	): string[] {
		return Array.from({ length: count }, (_, i) =>
			this.createServer(`${prefix}-${i+startindex}`, ram)
		);
	}

	public deleteServer(server: string): boolean {
		return this.ns.deleteServer(server);
	}

	public deleteServers(servers: string[]): boolean[] {
		return servers.map((server) => this.deleteServer(server));
	}

	botnetPrefix = "botnet";

	public createBotnetServers(count: number, ram: number): string[] {
		const existingServerCount = this.getBotnetServers().length;
		return this.createServersWithPrefix(this.botnetPrefix, count, ram, existingServerCount);
	}

	public getBotnetServers(): string[] {
		return this.ns
			.getPurchasedServers()
			.filter((server) => server.startsWith(this.botnetPrefix));
	}
}
