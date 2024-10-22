export async function main(ns) {
    ns.disableLog("ALL");
    var target = String(ns.args[0]);
    var hostname = ns.getHostname();
    if (target === "undefined") {
        ns.tprintRaw("Usage: run simplehack.ts <target>");
        ns.exit();
    }
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    while (true) {
      ns.print(`\nStarting Next itertation...`)
      var currentSecurity = ns.getServerSecurityLevel(target);
      var currentMoney = ns.getServerMoneyAvailable(target);

      ns.printf(`Server security -> Current: %s Threshold: %s`,  currentSecurity, securityThresh);
      ns.printf(`Server money    -> Current: %s Threshold: %s`,  currentMoney, moneyThresh);
          
      if (currentSecurity > securityThresh) {
          ns.printf(`Weakening...`,);
          var result = await ns.weaken(target);
          ns.print(`Weakened by ${result}`);
      }
      else if (currentMoney < moneyThresh) {
          ns.printf(`Growing...`);
          var result = await ns.grow(target);
          ns.print(`Grew by ${result}`);
      }
      else {
        ns.print("\nRequirements satisfied starting hack...")
        var money = await ns.hack(target);
        if (money === 0) {
            ns.printf(`Server %s failed to hack %s`, hostname, target);
        }
        else {
            ns.printf(`Server %s hacked %s for %s`, hostname, target, money);
        }
      }
    }
}