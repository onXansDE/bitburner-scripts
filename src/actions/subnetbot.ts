import { GoOpponent, NS } from "@ns";
import { MoveDecisionHandler } from "/lib/takeover";
import { UIHandler } from "/lib/ui";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

	const choices = ["Netburners", "Slum Snakes", "The Black Hand"];
	const choice = await ns.prompt("Choose enemy", { type: "select", choices });

	const enemy: GoOpponent = choice as GoOpponent;
	const fieldSize: 5 | 7 | 9 | 13 = 7;

	const th = new MoveDecisionHandler(ns);
	const ui = new UIHandler(ns);
	ui.tail();

	ns.go.resetBoardState(enemy, fieldSize);
	ns.print("Starting game...");

	let result: {
		type: "move" | "pass" | "gameOver";
		x: number | null;
		y: number | null;
	};

	let gamesPlayed = 0;
	let gamesWon = 0;

	let windowResiszed = false;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		let stats = ns.go.analysis.getStats();
		do {
			const validMoves = ns.go.analysis.getValidMoves();
			const board = ns.go.getBoardState();

			const move = th.getMove(board, validMoves);

			if (move.length === 0) {
				result = await ns.go.passTurn();
			} else {
				result = await ns.go.makeMove(move[0], move[1]);
			}

			await ns.go.opponentNextTurn();
			const state = ns.go.getGameState();
			ns.clearLog();
			for (let i = 0; i < board.length; i++) {
				ns.print(board[i]);
			}
			ns.print(`Game scores: ${state.blackScore} - ${state.whiteScore}`);
			ns.print(
				`Games played: ${gamesPlayed} - Games won: ${gamesWon} (${(
					(gamesWon / gamesPlayed) *
					100
				).toFixed(2)}%)`
			);
			ns.print(`Currently playing against: ${enemy}`);
			const entries = Object.entries(stats);
			for (const [opp, statistics] of entries) {
				const winRate = (statistics.wins / (statistics.wins + statistics.losses)) * 100;
				ns.print(`${opp}: ${statistics.wins} - ${statistics.losses} (${winRate.toFixed(2)}%) Streak: ${statistics.winStreak}/${statistics.highestWinStreak}`);
			}
		} while (result?.type !== "gameOver");
		const state = ns.go.getGameState();
		if (state.blackScore > state.whiteScore) {
			ns.print("Black wins");
			gamesWon++;
		} else {
			ns.print("White wins");
		}

		ns.print("Starting game...");
		stats = ns.go.analysis.getStats();
		if (!windowResiszed) {
			ui.autoSize();
			windowResiszed = true;
		}

		gamesPlayed++;
		ns.go.resetBoardState(enemy, fieldSize);
		
		await ns.sleep(200);
	}
}
