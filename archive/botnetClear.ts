import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    const botnet_prefix = String(ns.args[0]) || "botnet";

    const botnet = getBotNetServers(botnet_prefix);

    ns.print(`Botnet servers: ${botnet.join(", ")}`);

    for (const server of botnet) {
        ns.tprint(`Starting clear on ${server}`);
        const pid = ns.exec("clearServer.js", server, 1);
        ns.printf(`Starting %s on %s`, pid, server);
    }
    
    
    ns.tail();
    ns.exit();

    function getBotNetServers(prefix: string = "botnet"): string[] {
        return getAllServersStartingWith(prefix);

        function getAllServersStartingWith( prefix: string): string[] {
            let servers = getAllServers();
            const filtered = servers.filter((s) => s.startsWith(prefix));
            ns.print(`Found ${filtered.length} servers with prefix ${prefix}`);
            return filtered;

            function getAllServers(server: string = "home", visited: Set<string> = new Set()): string[] {
                visited.add(server);
                const servers = ns.scan(server).filter(s => !visited.has(s));
                for (const s of servers) {
                    getAllServers(s, visited);
                }
                return Array.from(visited).filter(s => s !== "home");
            }
        }
    }
}
