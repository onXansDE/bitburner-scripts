import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    if (ns.args.length < 2) {
        ns.tprintRaw("Usage: run botnetGrow.js <clear|keep> <target> <prefix?>");
        ns.tprintRaw("clear: clear all servers in the botnet before starting");
        ns.tprintRaw("keep: only start growth on servers with enough free RAM");
        ns.tprintRaw(" ");
        ns.tprintRaw("target: target server to grow to");
        ns.tprintRaw("prefix: prefix of the botnet servers (default: 'botnet')");
        return;
    }

    const clear_botnet = ns.args[0] === "clear" ? true : ns.args[0] === "keep" ? false : (() => { throw new Error("Invalid argument: Use 'clear' or 'keep'"); })();
    const target = String(ns.args[1]);
    if (!ns.serverExists(target)) {
        ns.tprint(`Server ${target} does not exist`);
        return;
    }
    const botnet_prefix = String(ns.args[2]) || "botnet";

    const botnet = getBotNetServers(botnet_prefix);

    ns.print(`Botnet servers: ${botnet.join(", ")}`);

    const growth_script_memory = ns.getScriptRam("_constantGrow.js");

    let startetServers = 0;

    for (const server of botnet) {
        const agent = ns.getServer(server);
        ns.tprint(`Starting on ${agent.hostname}`);
        const agentFreeRam = agent.maxRam - ns.getServerUsedRam(agent.hostname);
        if (agentFreeRam < growth_script_memory) {
            if (clear_botnet) {
                let pid =ns.exec("clearServer.js", agent.hostname, 1);
                while (ns.ps(agent.hostname).filter((p) => p.pid = pid).length > 0) {
                    await ns.sleep(500);
                }
                startGrowScript(agent);
                startetServers++;
                continue;
            }
            ns.print(`Skipping ${agent.hostname} due to insufficient free RAM`);
            continue;
        }
        startGrowScript(agent);
        startetServers++;
    }

    ns.print(`Started growth on ${startetServers} servers targeting ${target} servers`);
    ns.tail();

    function startGrowScript(server: Server) {
        ns.exec("_constantGrow.js", server.hostname, calculatePossibleThreads(server, growth_script_memory), target);
    }

    function calculatePossibleThreads(server: Server, scriptMemory: number) {
        return Math.floor((server.maxRam - ns.getServerUsedRam(server.hostname)) / scriptMemory);
    }

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
