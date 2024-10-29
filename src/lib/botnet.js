export class BotnetHandler {
	ns;
	constructor(ns) {
		this.ns = ns;
	}
	createServer(server, ram) {
		return this.ns.purchaseServer(server, ram);
	}
	createServers(servers) {
		return servers.map((server) => this.createServer(server.name, server.ram));
	}
	createServersWithPrefix(prefix, count, ram) {
		return Array.from({ length: count }, (_, i) =>
			this.createServer(`${prefix}-${i}`, ram)
		);
	}
	deleteServer(server) {
		return this.ns.deleteServer(server);
	}
	deleteServers(servers) {
		return servers.map((server) => this.deleteServer(server));
	}
	botnetPrefix = "botnet";
	createBotnetServers(count, ram) {
		return this.createServersWithPrefix(this.botnetPrefix, count, ram);
	}
	getBotnetServers() {
		return this.ns
			.getPurchasedServers()
			.filter((server) => server.startsWith(this.botnetPrefix));
	}
}
