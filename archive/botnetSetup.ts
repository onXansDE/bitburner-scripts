import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    // args
    // all: setup all servers in the botnet
    // free: setup only servers with full free RAM

    // optional: prefix of the botnet servers
    ns.disableLog("ALL");

    if (ns.args.length < 2) {
        ns.tprintRaw("Usage: run botnetGrow.js <all|free> <prefix?>");
        ns.tprintRaw("all: setup all servers in the botnet");
        ns.tprintRaw("free: setup only servers with full free RAM");
        ns.tprintRaw("prefix: prefix of the botnet servers (default: 'botnet')");
        return;
    }

    const clear_botnet = ns.args[0] === "all" ? true : ns.args[0] === "free" ? false : (() => { throw new Error("Invalid argument: Use 'clear' or 'keep'"); })();
    const prefix = String(ns.args[1]);

    let botnet = getBotNetServers(prefix)
    if (botnet.length === 0) {
        ns.tprint(`No servers found with prefix ${prefix}`);
        return;
    }

    if(!clear_botnet) {
        botnet = botnet.filter((s) => {
            const server = ns.getServer(s);
            return ns.getServerUsedRam(server.hostname) === 0;
        });
    }

    ns.tprintRaw(`Botnet servers: ${botnet.join(", ")}`);
    
    const agentScripts = ["constanGrow.js", "clearServer.js"];

    ns.tprintf(`Copying %s to all %s`, agentScripts.join(", "), botnet.join(", "));

    for (const server of botnet) {
        ns.scp(agentScripts, server, "home");
        ns.tprint(`Copied ${agentScripts} to ${server}`);
    }

    ns.print(`Copied scripts to all servers`);

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
