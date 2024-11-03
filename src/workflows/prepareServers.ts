import { NS } from "@ns";
import { ServerHandler } from "/lib/server";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();
	const sh = new ServerHandler(ns);

	const hosts = sh.getExternalServers();

	// eslint-disable-next-line no-constant-condition
	while(true) {
        const servers = sh.getServers(hosts);
        const finishedServers: string[] = [];
        for (const server of servers) {
            if(server.purchasedByPlayer) continue;
            if(!server.moneyMax || server.moneyMax === 0) continue;
            if(!server.moneyAvailable || server.moneyAvailable === 0) continue;
            if(!server.minDifficulty || server.minDifficulty === 0) continue;
            if(!server.hackDifficulty || server.hackDifficulty === 0) continue;
            if(!server.hasAdminRights) continue;
            if(server.moneyAvailable === server.moneyMax && server.minDifficulty === server.hackDifficulty) {
                finishedServers.push(server.hostname);
                continue;
            }
            if(server.minDifficulty < server.hackDifficulty) {
                const time = ns.getWeakenTime(server.hostname);
                ns.print(`${ns.tFormat(time)} to weaken ${server.hostname}...`);
                const result = await ns.weaken(server.hostname);
                ns.print(`Weakened ${server.hostname} by ${result}`);
                continue;
            }
            if(server.moneyAvailable < server.moneyMax) {
                const time = ns.getGrowTime(server.hostname);
                ns.print(`${ns.tFormat(time)} to grow ${server.hostname}...`);
                const result = await ns.grow(server.hostname);
                ns.print(`Grew ${server.hostname} by ${result}`);
                continue;
            }
            if (finishedServers.length === servers.length) {
                ns.print("All servers are finished");
                break;
            }
        }
        await ns.sleep(100);
    }
}
