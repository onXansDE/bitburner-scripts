import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("ALL");
    ns.clearLog();

    const input = await ns.prompt("Enter the port to read", { type: "text" });
    const port = Number(input);
    if (isNaN(port)) {
        ns.tprint("Invalid port");
        ns.exit();
    }

    ns.tail();
    const handle = ns.getPortHandle(port);
    
    do {
        if (handle.empty()) {
            await ns.sleep(1000);
            continue;
        }
        const data = handle.read();
        ns.print(data);
    // eslint-disable-next-line no-constant-condition
    } while (true);
}