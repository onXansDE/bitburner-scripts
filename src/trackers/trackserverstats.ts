import { NS } from "@ns";
import { ReservedPorts } from "/lib/types";
import { ServerHandler } from "/lib/server";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const handle = ns.getPortHandle(ReservedPorts.SERVER_STATS);
    const sh = new ServerHandler(ns)
    const attackServers = sh.getRootServers().filter(server => ns.getServerMoneyAvailable(server) !==  0 || ns.getServerMaxMoney(server) !== 0);

    do {
        handle.clear();
        handle.write("NEWDATA");
        const servers = sh.getServers(attackServers);
        const player = ns.getPlayer();
        let line = "";
        servers.forEach(server => {
            const growTime = ns.getGrowTime(server.hostname);
            const hackTime = ns.getHackTime(server.hostname);
            const weakenTime = ns.getWeakenTime(server.hostname);
            const hackAmount = ns.formulas.hacking.hackPercent(server, player);
            const hackChance = ns.formulas.hacking.hackChance(server, player);
            const infos = [server.hostname, server.moneyAvailable, server.hackDifficulty, growTime, hackTime, weakenTime, hackAmount, hackChance];
            line += infos.join(",") + "\n";
        });
        // create a csv string and write it to the handle
        const csv = "hostname,moneyAvailable,moneyMax,hackDifficulty,growTime,hackTime,weakenTime,hackAmount,hackChance\n" + line;
        handle.write(csv);
        await ns.sleep(1000);
    // eslint-disable-next-line no-constant-condition
    } while (true);
}