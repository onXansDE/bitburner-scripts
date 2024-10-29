import { NS, Server } from "@ns";

export class ServerHandler {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    public getAllServers(server: string = "home", visited: Set<string> = new Set(), includeHome: boolean = false): string[] {
        visited.add(server);
        const servers = this.ns.scan(server).filter(s => !visited.has(s));
        for (const s of servers) {
            this.getAllServers(s, visited);
        }
        return Array.from(visited).filter(s => includeHome || s !== "home");
    }

    public getRootServers(): string[] {
        return this.getAllServers().filter(server => this.ns.hasRootAccess(server));
    }

    public getBotnetServers(): string[] {
        return this.getAllServers().filter(server => server.startsWith("botnet-"));
    }

    public getServers(servers: string[]): Server[] {
        return servers.map(server => this.ns.getServer(server));
    }

    public findServers(match: string | string[]): string[] {
        if (Array.isArray(match)) {
            return match.flatMap(m => this.findServers(m));
        }
        switch (match) {
            case "root":
                return this.getRootServers();
            case "all":
                return this.getAllServers();
            case "botnet":
                return this.getBotnetServers();
            case "home":
                return ["home"];
            default:
                return this.findServersByName(match);
        }
    }

    public findServersByName(name: string): string[] {
        const servers = this.getAllServers();
    
        // Check if the name starts with a wildcard '%' (any characters before the name)
        const startsWithWildcard = name.startsWith('%');
        
        // Check if the name ends with a wildcard '%' (any characters after the name)
        const endsWithWildcard = name.endsWith('%');
    
        // Remove '%' from the name for comparison
        const cleanName = name.replace(/%/g, '');
    
        return servers.filter(server => {
            if (startsWithWildcard && endsWithWildcard) {
                return server.includes(cleanName);
            } else if (startsWithWildcard) {
                return server.endsWith(cleanName);
            } else if (endsWithWildcard) {
                return server.startsWith(cleanName);
            } else {
                return server === cleanName;
            }
        });
    }

    public getAvailablePortCrackerCount() {
        var count = 0;

        if (this.ns.fileExists("BruteSSH.exe", "home")) {
            count++;
        }

        if (this.ns.fileExists("FTPCrack.exe", "home")) {
            count++;
        }

        if (this.ns.fileExists("relaySMTP.exe", "home")) {
            count++;
        }

        if (this.ns.fileExists("HTTPWorm.exe", "home")) {
            count++;
        }

        if (this.ns.fileExists("SQLInject.exe", "home")) {
            count++;
        }

        return count;
    }

    public canNuke(server: Server): boolean {

        const currentHackingLevel = this.ns.getHackingLevel();
        const currentHackingToolCount = this.getAvailablePortCrackerCount();

        if (server.purchasedByPlayer) {
            this.ns.print(`INFO Server ${server.hostname} cant be nuked because it is owned by the player`);
            return false;
        }

        if (server.hasAdminRights) {
            this.ns.print(`INFO Server ${server.hostname} is already hacked`);
            return false;
        }
    
        if(server.hackDifficulty! > currentHackingLevel) {
            this.ns.print(`WARN Server ${server.hostname} cant be hacked because the hacking level is too low`);
            return false;
        } else if(currentHackingToolCount < server.numOpenPortsRequired!) {
            this.ns.print(`WARN Server ${server.hostname} cant be hacked because the hacking tool count is too low`);
            return false;
        }

        return true;
    }

    public openPorts(server: Server): number {

        let portsOpened = 0;
        if(!server.sshPortOpen && this.ns.fileExists("BruteSSH.exe", "home")) {
            this.ns.brutessh(server.hostname);
            this.ns.print(`SUCCESS Opened SSH port on ${server.hostname}`);
            portsOpened++;
        }
    
        if(!server.ftpPortOpen && this.ns.fileExists("FTPCrack.exe", "home")) {
            this.ns.ftpcrack(server.hostname);
            this.ns.print(`SUCCESS Opened FTP port on ${server.hostname}`);
            portsOpened++;
        }
    
        if(!server.smtpPortOpen && this.ns.fileExists("relaySMTP.exe", "home")) {
            this.ns.relaysmtp(server.hostname);
            this.ns.print(`SUCCESS Opened SMTP port on ${server.hostname}`);
            portsOpened++;
        }
    
        if(!server.httpPortOpen && this.ns.fileExists("HTTPWorm.exe", "home")) {
            this.ns.httpworm(server.hostname);
            this.ns.print(`SUCCESS Opened HTTP port on ${server.hostname}`);
            portsOpened++;
        }
    
        if(!server.sqlPortOpen && this.ns.fileExists("SQLInject.exe", "home")) {
            this.ns.sqlinject(server.hostname);
            this.ns.print(`SUCCESS Opened SQL port on ${server.hostname}`);
            portsOpened++;
        }

        return portsOpened;
    }

    public nukeServer(server: Server): boolean {
        if (!this.canNuke(server)) {
            return false;
        }

        this.openPorts(server);
        this.ns.nuke(server.hostname);
        if(this.ns.hasRootAccess(server.hostname)) {
            return false;
        }
        return false;
    }

    public killAllProcesses(server: Server | string): boolean {
        const serverName = typeof server === "string" ? server : server.hostname;
        let error = false;
        for (const process of this.ns.ps(serverName)) {
            this.ns.kill(process.pid) ? true : error = true;
        }
        return !error;
    }

    public getProcesses(server: Server | string, name?: string): number[] {
        const serverName = typeof server === "string" ? server : server.hostname;
        const processes = this.ns.ps(serverName);
        if (name) {
            return processes.filter(proc => proc.filename === name).map(proc => proc.pid);
        }
        return processes.map(proc => proc.pid);
    }

    public killProcesses(pids: number[] | number): boolean {
        let killed = 0;
        if (!Array.isArray(pids)) {
            pids = [pids];
        }
        for (const pid of pids) {
            this.ns.kill(pid);
            killed++;
        }
        return killed === pids.length;
    }

    public whipeDrive(server: Server | string, substring?: string): boolean {
        const serverName = typeof server === "string" ? server : server.hostname;
        const files = this.ns.ls(serverName, substring);
        let error = false;
        for (const file of files) {
            this.ns.rm(file, serverName) ? true : error = true;
        }
        return !error;
    }

    public isCleanServer(server: Server | string): boolean {
        const serverName = typeof server === "string" ? server : server.hostname;
        const processes = this.ns.ps(serverName).length;
        const files = this.ns.ls(serverName, ".js").length;
        return processes === 0 && files === 0;
    }
}