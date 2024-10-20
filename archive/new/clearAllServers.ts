import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");

    const servers = getAllServers(); // Add all server names here

    const rootServers = getRootServers(servers);
    const scriptName = String(ns.args[0]);

    if (scriptName === "undefined") {
        ns.tprintRaw("No script name provided, clearing all scripts on all servers");
        for (const server of rootServers) {
            const scripts = ns.ps(server).map(proc => [proc.pid, proc.filename as string]);
            for (const [pid, script] of scripts) {
                await ns.kill(pid as number);
                await ns.rm(script as string, server);
                ns.print(`Cleared ${script} on ${server}`);
            }
            // check if any scripts are still running
            if (ns.ps(server).length > 0) {
                ns.tprint(`Failed to clear all scripts on ${server}`);
            }
        }
        await ns.sleep(1000);
        ns.tprint("Done clearing all scripts on all servers");
    } else {
        for (const server of servers) {
            if (ns.serverExists(server) && ns.fileExists(scriptName, server)) {
                await ns.kill(scriptName, server);
                await ns.rm(scriptName, server);
                ns.print(`Cleared script ${scriptName} on ${server}`);
            }
        }
        await ns.sleep(1000);
        ns.tprint(`Done clearing all instances of ${scriptName} on all servers`);
    }

    ns.tail();
    ns.exit();

    function getAllServers(server: string = "home", visited: Set<string> = new Set()): string[] {
        visited.add(server);
        const servers = ns.scan(server).filter(s => !visited.has(s));
        for (const s of servers) {
            getAllServers(s, visited);
        }
        return Array.from(visited).filter(s => s !== "home");
    }

    function getRootServers(servers: string[]): string[] {
        return servers.filter(server => ns.hasRootAccess(server));
    }

    function getServerListWithRunningProcesses(rootServers: string[]) {
        return rootServers.map(server => {
            const processes = ns.ps(server).map(proc => proc.filename);
            return `${server} (${processes.length} processes)`;
        });
    }
}