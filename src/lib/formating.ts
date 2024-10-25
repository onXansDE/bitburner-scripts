import { NS, Server } from "@ns";

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
            string += ` ${info}`;
        }

        return string;
    }

    public printOptimalThreadUsage(amounts: [number, number, number]): string {
       return `Optimal thread usage: Growth: ${amounts[0]} | Hack: ${amounts[1]} | Weaken: ${amounts[2]}`;
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

    getTrendFormated(records: number[]): string {
        if (records.length < 2) {
            return "";
        }
        const last = records[records.length - 1];
        const before = records[records.length - 2];
        const diff = last - before;
        const trend = diff > 0 ? "📈" : "📉";
        return `${trend} ${diff.toFixed(2)}`;
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