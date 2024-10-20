import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("sleep");

    const servername = String(ns.args[0]);

    if (ns.args.length !== 1 || !ns.serverExists(servername)) {
        ns.tprint("No valid server provided");
        return;
    }

    

    let server = ns.getServer(servername);
    if (server.purchasedByPlayer) {
        ns.tprint(`Server ${servername} cant be tracked because it is owned by the player`);
        return;
    }
    
    const serverBaseSecurity = server.baseDifficulty;
    const serverMinSecurity = server.minDifficulty;

    const serverMaxMoney = server.moneyMax;
    
    ns.tail()

    while (true) {
        server = ns.getServer(servername);
        const currentSecurity = server.hackDifficulty;
        const currentMoney = server.moneyAvailable ?? 0;
        const currentGrowth = server.serverGrowth;
        const ip = server.ip
        const ownedby = server.organizationName

        ns.print(`Server: ${servername} (${ip}, ${ownedby})`);
        ns.print(`Security: ${currentSecurity} (Base: ${serverBaseSecurity}, Min: ${serverMinSecurity})`);
        ns.print(`Money: ${formatMoney(Math.floor(currentMoney ?? 0))} (Max: ${formatMoney(serverMaxMoney ?? 0)})`);
        ns.print(`Growth: ${currentGrowth}`);
        ns.print(``);
        await ns.sleep(1000);
        ns.clearLog();
    }
}

function formatMoney(money: number): string {
    if (money >= 1e12) {
        return (money / 1e12).toFixed(4) + ' T';
    } else if (money >= 1e9) {
        return (money / 1e9).toFixed(4) + ' B';
    } else if (money >= 1e6) {
        return (money / 1e6).toFixed(4) + ' M';
    } else if (money >= 1e3) {
        return (money / 1e3).toFixed(4) + ' k';
    } else {
        return money.toFixed(2);
    }
}