import { NS, Server } from "@ns";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");

	const cpu_core_weight = 1;
	const ram_weight = 1.5;

	if (ns.args.length <= 5) {
		ns.tprintRaw(
			"Usage: run distributedAttack.js <victimAttackMode> <victimGroups> <attackMode> <attackGroups> <script> <targetServers...>"
		);
		ns.tprintRaw("victimAttackMode: even, max, min, random");
		ns.tprintRaw(
			"victimGroups: number of groups to split the target servers into"
		);
		ns.tprintRaw("attackMode: even, random, memory, cores, coreAndMemory");
		ns.tprintRaw(
			"attackGroups: number of groups to split the attacker servers into"
		);
		ns.tprintRaw("script: script to run on the attacker servers");

		return;
	}

	var victimAttackMode = String(ns.args[0]);
	var victimGroups = Number(ns.args[1]);
	var attackMode = String(ns.args[2]);
	var attackGroups = Number(ns.args[3]);
	var script = String(ns.args[4]);

	var scriptMemory = ns.getScriptRam(script);

	if (victimAttackMode === "undefined") victimAttackMode = "even";

	if (victimGroups === 0) victimGroups = 1;

	var targetServers = splitTargetServers(
		ns.args.slice(5).map((s) => ns.getServer(String(s))),
		victimGroups,
		victimAttackMode
	);

	ns.exec("clearAllServers.js", "home", 1, script);
	const args = ns.args.slice(5).map((s) => String(s));
	ns.exec("distributeOnAllServers.js", "home", 1, script);

	ns.tail();

	ns.print(
		`Splitting targets ${targetServers.length} servers into ${victimGroups} groups using ${victimAttackMode} method:`
	);

	for (var i = 0; i < targetServers.length; i++) {
		for (var j = 0; j < targetServers[i].length; j++) {
			printTargetServer(targetServers[i][j]);
		}
		ns.print(" ");
	}
	await ns.sleep(5000);

	ns.print(" ");

	var attackServers = getRootServers(getAllServers());

	var attackServerGroups = splitAttackServers(
		attackServers,
		attackGroups,
		attackMode
	);

	ns.print(
		`Splitting ${attackServers.length} attackers into ${attackGroups} groups using ${attackMode} method:`
	);

	for (var i = 0; i < attackServerGroups.length; i++) {
		for (var j = 0; j < attackServerGroups[i].length; j++) {
			printAttackerServer(attackServerGroups[i][j]);
		}
		ns.print(" ");
	}

	ns.print(" ");
	ns.print("Starting attack");

	await ns.sleep(5000);

	for (var i = 0; i < attackGroups; i++) {
		attackGroup(attackServerGroups[i], targetServers[i % victimGroups]);
	}

	await ns.sleep(5000);

	// Add this logging before the attack loop
	ns.print(`targetServers: ${JSON.stringify(targetServers)}`);
	ns.print(`victimGroups: ${victimGroups}`);
	ns.print(`attackServerGroups: ${JSON.stringify(attackServerGroups)}`);
	ns.print(`attackGroups: ${attackGroups}`);

	// Add this logging before the attack loop
	ns.print(
		`Starting attack with ${attackGroups} attack groups and ${victimGroups} victim groups`
	);
	for (var i = 0; i < attackGroups; i++) {
		if (!attackServerGroups[i] || !targetServers[i % victimGroups]) {
			ns.print(
				`Skipping attack group ${i} due to undefined target or attacker group`
			);
			continue;
		}
		attackGroup(attackServerGroups[i], targetServers[i % victimGroups]);
	}

	function calulateMaxThreads(server: Server): number {
		return Math.floor(server.maxRam / scriptMemory);
	}

	function attackGroup(attackerGroup: Server[], targetGroup: Server[]): void {
		for (var i = 0; i < attackerGroup.length; i++) {
			attackServer(attackerGroup[i], targetGroup[i % targetGroup.length]);
		}
	}

	function attackServer(attacker: Server, target: Server): void {
		ns.print(`Attacking ${attacker.hostname} -> ${target.hostname}`);
		ns.killall(attacker.hostname);
		ns.exec(
			script,
			attacker.hostname,
			calulateMaxThreads(attacker),
			target.hostname
		);
	}

	function getAllServers(
		server: string = "home",
		visited: Set<string> = new Set()
	): Server[] {
		visited.add(server);
		const servers = ns.scan(server).filter((s) => !visited.has(s));
		for (const s of servers) {
			getAllServers(s, visited);
		}
		return Array.from(visited)
			.filter((s) => s !== "home")
			.map((s) => ns.getServer(s));
	}

	function getRootServers(servers: Server[]): Server[] {
		return servers.filter((server) => server.hasAdminRights);
	}

	function splitTargetServers(
		servers: Server[],
		groups: number,
		method: string
	): Server[][] {
		switch (method) {
			case "even":
				return splitEven(servers, groups);
			case "max":
				return splitMax(servers, groups);
			case "min":
				return splitMin(servers, groups);
			case "random":
				return splitRandom(servers, groups);
			default:
				return [];
		}
	}

	function splitAttackServers(
		servers: Server[],
		groups: number,
		method: string
	): Server[][] {
		switch (method) {
			case "even":
				return splitEven(servers, groups);
			case "random":
				return splitRandom(servers, groups);
			case "memory":
				return splitMemory(servers, groups);
			case "cores":
				return splitCores(servers, groups);
			case "coreAndMemory":
				return splitCoreAndMemory(servers, groups);
			default:
				return [];
		}
	}

	function splitRandom(servers: Server[], groups: number): Server[][] {
		const groupsArray: Server[][] = Array.from(
			{ length: groups },
			() => []
		);
		for (const server of servers) {
			const randomIndex = Math.floor(Math.random() * groups);
			groupsArray[randomIndex].push(server);
		}
		return groupsArray;
	}

	function splitEven(servers: Server[], groups: number): Server[][] {
		const groupSize = Math.floor(servers.length / groups);
		let remainder = servers.length % groups;

		const groupsArray: Server[][] = [];
		let startIndex = 0;

		for (let i = 0; i < groups; i++) {
			const endIndex = startIndex + groupSize + (remainder > 0 ? 1 : 0);
			groupsArray.push(servers.slice(startIndex, endIndex)); // Pushes a subarray into groupsArray
			startIndex = endIndex;
			remainder--;
		}

		return groupsArray; // Returns an array of arrays
	}

	function splitMax(servers: Server[], groups: number): Server[][] {
		const sortedServers = servers.sort(sortByMaxMoney);
		return splitEven(sortedServers, groups);
	}

	function splitMin(servers: Server[], groups: number): Server[][] {
		const sortedServers = servers.sort(sortByMinSecurity);
		return splitEven(sortedServers, groups);
	}

	function splitMemory(servers: Server[], groups: number): Server[][] {
		const sortedServers = servers.sort(sortByMaxMemory);
		return splitEven(sortedServers, groups);
	}

	function splitCores(servers: Server[], groups: number): Server[][] {
		const sortedServers = servers.sort(sortByCoreCount);
		return splitEven(sortedServers, groups);
	}

	function splitCoreAndMemory(servers: Server[], groups: number): Server[][] {
		const sortedServers = servers.sort(sortByCoreAndMemory);
		return splitEven(sortedServers, groups);
	}

	function sortByMaxMoney(a: Server, b: Server): number {
		return b.moneyMax! - a.moneyMax!;
	}

	function sortByMinSecurity(a: Server, b: Server): number {
		return b.minDifficulty! - a.minDifficulty!;
	}

	function sortByMaxMemory(a: Server, b: Server): number {
		return b.maxRam! - a.maxRam!;
	}

	function sortByCoreCount(a: Server, b: Server): number {
		return b.cpuCores! - a.cpuCores!;
	}

	function sortByCoreAndMemory(a: Server, b: Server): number {
		return (
			b.cpuCores! * cpu_core_weight +
			b.maxRam! * ram_weight -
			(a.cpuCores! * cpu_core_weight + a.maxRam! * ram_weight)
		);
	}

	function printTargetServer(server: Server): void {
		const moneyFormatted = formatMoney(server.moneyMax!);
		const serverName = server.hostname;
		const isAdmin = server.hasAdminRights;
		const skillRequirement = server.requiredHackingSkill;

		// [admin ? x/checkmark] - serverName - $max: moneyFormated - skill: skillRequirement
		ns.print(
			`[${
				isAdmin ? "x" : " "
			}] - ${serverName} - $max: ${moneyFormatted} - skill: ${skillRequirement}`
		);
	}

	function printAttackerServer(server: Server): void {
		const serverName = server.hostname;
		const memory = server.maxRam;
		const cpu = server.cpuCores;
		// [admin ? x/checkmark] - serverName - $max: moneyFormated - skill: skillRequirement
		ns.print(`${serverName} - $MEM: ${memory} - cores: ${cpu}`);
	}

	function formatMoney(money: number): string {
		if (money >= 1e12) {
			return (money / 1e12).toFixed(4) + " T";
		} else if (money >= 1e9) {
			return (money / 1e9).toFixed(4) + " B";
		} else if (money >= 1e6) {
			return (money / 1e6).toFixed(4) + " M";
		} else if (money >= 1e3) {
			return (money / 1e3).toFixed(4) + " k";
		} else {
			return money.toFixed(4);
		}
	}
}
