import { GoOpponent, NS } from "@ns";
import { SubNethandler } from "/lib/takeover";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();

	const enemy: GoOpponent = "The Black Hand";
	const fieldSize: 5 | 7 | 9 | 13 = 7;

	const th = new SubNethandler(ns);

	ns.go.resetBoardState(enemy, fieldSize);
	ns.print("Starting game...");

	let result: {
		type: "move" | "pass" | "gameOver";
		x: number | null;
		y: number | null;
	};

	let gamesPlayed = 0;
	let gamesWon = 0;

	// eslint-disable-next-line no-constant-condition
	while (true) {
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
		} while (result?.type !== "gameOver");
		ns.clearLog();
		const state = ns.go.getGameState();
		if (state.blackScore > state.whiteScore) {
			ns.print("Black wins");
			gamesWon++;
		} else {
			ns.print("White wins");
		}
		gamesPlayed++;
		ns.go.resetBoardState(enemy, fieldSize);
		ns.print("Starting game...");
		await ns.sleep(200);
	}
}
