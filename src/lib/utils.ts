import { NS, Server } from "@ns";

export class XanApi {
    private ns: NS;

    public servers: ServerHandler;
    public formating: TextFormater;
    public ui: UIHandler;
    public files: FileHandler;

    constructor(ns: NS) {
        this.ns = ns;
        this.servers = new ServerHandler(ns);
        this.formating = new TextFormater(ns);
        this.ui = new UIHandler(ns);
        this.files = new FileHandler(ns);
    }
}

export class FileHandler {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    public getScriptMemory(script: string): number {
        return this.ns.getScriptRam(script, "home");
    }

    public pushToServer(server: Server | string, scripts: string[]): boolean {
        const serverName = typeof server === "string" ? server : server.hostname;
        return this.ns.scp(scripts, serverName);
    }

    public searchFiles(files: string[], server: string = "home"): string[] {
        return files.filter(file => this.ns.fileExists(file, server));
    }

    public calculatePossibleThreads(server: Server | string, scriptMemory: number) {
        if (typeof server === "string") {
            return this.calcPossibleThreads(this.ns.getServerMaxRam(server), this.ns.getServerUsedRam(server), scriptMemory);
        }
        return Math.floor((server.maxRam - this.ns.getServerUsedRam(server.hostname)) / scriptMemory);
    }

    calcPossibleThreads(maxRam: number, usedRam: number, scriptRam: number): number {
        return Math.floor((maxRam - usedRam) / scriptRam);
    }

    public canRunScript(server: Server | string, scriptMemory: number): boolean {
        return this.calculatePossibleThreads(server, scriptMemory) > 0;
    }

    public runScript(server: string, script: string, threads: number = 1, ...args: string[]): number {
        const pid = this.ns.exec(script, server, threads, ...args);
        if (pid === 0) {
            this.ns.print(`ERROR Failed to start script ${script} on ${server}`);
        } else {
            this.ns.print(`SUCCESS Started script ${script} [${args.join(", ")}] (${threads}) on ${server} with PID ${pid}`);
        }
        return pid;
    }

    public async watchScript(server: string, script: string, threads: number = 1, ...args: string[]): Promise<boolean> {
        const pid = this.runScript(server, script, threads, ...args);
        if (pid === 0) {
            return false;
        }
        while(this.ns.isRunning(pid)) {
            await this.ns.sleep(500);
        }
        return true;
    }
}

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

    public findServers(match: string): string[] {
        switch (match) {
            case "root":
                return this.getRootServers();
            case "all":
                return this.getAllServers();
            case "botnet":
                return this.getBotnetServers();
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
            this.ns.tprint(`SUCCESS Root access to ${server.hostname} gained`);
            return true;
        }
        return false;
    }

    public killAllProcesses(server: Server | string): boolean {
        const serverName = typeof server === "string" ? server : server.hostname;
        const processes = this.ns.ps(serverName);
        let error = false;
        for (const process of processes) {
            this.ns.kill(process.pid) ? this.ns.print(`SUCCESS Killed process ${process.filename} on ${serverName}`) : error = true;
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
            this.ns.rm(file, serverName) ? this.ns.print(`SUCCESS Removed file ${file} from ${serverName}`) : error = true;
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

export class UIHandler {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    private charWidth = 10;
    private lineHeight = 8;

    public getTextWidth(text: string): number {
        const longestLineLength = text.split("\n").reduce((max, line) => Math.max(max, line.length), 0);
        return longestLineLength * this.charWidth;
    }

    public getHeightForLines(lines: number): number {
        return lines * this.lineHeight;
    }
}

export class TextFormater {
    private ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    public formatMoney(money: number): string {
        if (money >= 1e12) {
            return (money / 1e12).toFixed(4) + ' T';
        } else if (money >= 1e9) {
            return (money / 1e9).toFixed(4) + ' B';
        } else if (money >= 1e6) {
            return (money / 1e6).toFixed(4) + ' M';
        } else if (money >= 1e3) {
            return (money / 1e3).toFixed(4) + ' k';
        } else {
            return money.toFixed(4);
        }
    }

    public formatDifficulty(difficulty: number | undefined): string {
        if (difficulty === undefined) {
            return "N/A";
        }
        return difficulty.toFixed(2);
    }

    public getServerDisplayString(server: Server, selection: DisplayPreset[] = this.getDefaultDisplay() ): string {

        // [isAdmin] serverName -> 
        let string = `[${server.hasAdminRights ? "x": " "}${server.backdoorInstalled ? "|💥": ""}] ${server.hostname} ->`;
        // now add the rest of the properties based on the selection
        for (const prop of selection) {
            const info = this.getFormatedInfo(server, prop);
            string += `  ${info}`;
        }

        return string;
    }

    getDefaultDisplay(): DisplayPreset[] {
        return [
            DisplayPreset.MONEY_FULL_PERCENT,
            DisplayPreset.DIFFICULTY_PERCENT,
            DisplayPreset.HACK_DIFFICULTY,
        ];
    }

    getFormatedInfo(server: Server, preset: DisplayPreset): string {
        switch (preset) {
            case DisplayPreset.MONEY:
                return this.formatString(preset, [this.formatMoney(server.moneyAvailable ?? 0)]);
            case DisplayPreset.MONEY_FULL:
                return this.formatString(preset, [this.formatMoney(server.moneyAvailable ?? 0), this.formatMoney(server.moneyMax ?? 0)]);
            case DisplayPreset.MONEY_FULL_PERCENT:
                return this.formatString(preset, [
                    this.formatMoney(server.moneyAvailable ?? 0), 
                    this.formatMoney(server.moneyMax ?? 0), 
                    (server.moneyAvailable ?? 0) / (server.moneyMax ?? 1) * 100
                ]);
            case DisplayPreset.DIFFICULTY_PERCENT:
                return this.formatString(preset, [
                    this.formatDifficulty(server.hackDifficulty) ?? 0, 
                    this.formatDifficulty(server.minDifficulty) ?? 0, 
                    ((server.hackDifficulty ?? 0) / (server.minDifficulty ?? 1) * 100)
                ]);
            case DisplayPreset.HACK_DIFFICULTY:
                return this.formatString(preset, [server.requiredHackingSkill ?? 0]);
            default:
                throw new Error(`Unknown preset ${preset}`);
        }
    }

    formatString(template: string, values: (string | number)[]): string {
        let valueIndex = 0;
        

        return template.replace(/%[sd]/g, (match) => {
            if (valueIndex >= values.length) {
                throw new Error("Not enough values provided for the template");
            }
            const value = values[valueIndex++];
            if (match === "%s" && typeof value === "string") {
                return value;
            } else if (match === "%d" && typeof value === "number") {
                return value.toFixed(2);
            } else {
                this.ns.tprint(`ERROR Type mismatch for placeholder ${match}, expected ${this.getPlaceHolderType(match)} but got ${typeof value}`);
                return String(value);
            }
        });
    }

    getPlaceHolderType(placeholder: string): string {
        switch (placeholder) {
            case "%s":
                return "string";
            case "%d":
                return "number";
            default:
                throw new Error(`Unknown placeholder ${placeholder}`);
        }
    }
}

export enum DisplayPreset {
    MONEY = "%s$",
    // 23.4 M$ | 50 M$
    MONEY_FULL = "%s$ | %s$",
    // 23.4 M$ / 50 M$ (50%)
    MONEY_FULL_PERCENT = "%s$ / %s$ (%d%)",
    // 11 / 20 (55%)
    DIFFICULTY_PERCENT = "%s / %s (%d%)",
    // 🔆 10
    HACK_DIFFICULTY = "🔆 %d"
}
