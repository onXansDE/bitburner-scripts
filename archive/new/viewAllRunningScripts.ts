import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    
    const cpu_core_weight = 1;
    const ram_weight = 1.5;

    if (ns.args.length !== 1) {
        ns.tprintRaw("Usage: run viewAllRunningScripts.js <sortMethod>");
        ns.tprintRaw("sortMethod: cores, memory, coreAndMemory");
        return;
    }

    var sortMethod = ns.args[0];
    

    const servers = getRootServers(getAllServers());

    var lines = getServerListWithRunningProcesses(servers);

    // ns.print all running processes on all servers
    ns.printRaw(`\nAll Running Scripts:\n${lines.join("\n")}`);

    ns.tail();

    // calculate tail width based on the longest line
    const tail_width = lines.reduce((max, line) => Math.max(max, line.length), 0);

    ns.resizeTail(tail_width * 10, (Math.max(lines.length, 10) + 1) * 20);

    function getServerListWithRunningProcesses(servers: Server[]): string[] {
        var proccesList: string[] = [];
        servers = sort(servers);
        for (const server of servers) {
            const processes = ns.ps(server.hostname)
            for (const process of processes) {
                proccesList.push(`[${server.hostname}|${server.cpuCores} CPU|${server.maxRam} RAM] (PID: ${process.pid}) -> ${process.filename} - ${process.args.join(" ")}`);
            }
        }
        return proccesList;
    }

    function sort(servers: Server[]): Server[] {
        switch (sortMethod) {
            case "coreAndMemory":
                return servers.sort(sortByCoreAndMemory);
            case "cores":
                return servers.sort(sortByCoreCount);
            case "memory":
                return servers.sort(sortByMaxMemory);
            default:
                return servers;
        }
    }

    function getAllServers(
		server: string = "home",
		visited: Set<string> = new Set()
	): Server[] {
		visited.add(server);
		const servers = ns.scan(server).filter((s) => !visited.has(s));
		for (const s of servers) {
			getAllServers(s, visited);
		}
		return Array.from(visited)
			.map((s) => ns.getServer(s));
	}

	function getRootServers(servers: Server[]): Server[] {
		return servers.filter((server) => server.hasAdminRights);
	}

	function sortByMaxMemory(a: Server, b: Server): number {
		return b.maxRam! - a.maxRam!;
	}

	function sortByCoreCount(a: Server, b: Server): number {
		return b.cpuCores! - a.cpuCores!;
	}

	function sortByCoreAndMemory(a: Server, b: Server): number {
		return (b.cpuCores! * cpu_core_weight + b.maxRam! * ram_weight) - (a.cpuCores! * cpu_core_weight + a.maxRam! * ram_weight);
	}
}