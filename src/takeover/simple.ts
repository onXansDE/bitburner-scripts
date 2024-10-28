import { NS } from "@ns";
import { XanApi } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
	ns.disableLog("ALL");
	ns.clearLog();
	ns.go.resetBoardState("Netburners", 7);
	ns.print("Starting game...");

	let result: {
		type: "move" | "pass" | "gameOver";
		x: number | null;
		y: number | null;
	};

	const getRandomMove = (board: string[], validMoves: boolean[][]) => {
		const moveOptions = [];
		const size = board[0].length;

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const isNotReserved = i % 2 === 1 || j % 2 === 1;
				if (validMoves[i][j] && isNotReserved) {
					moveOptions.push([i, j]);
				}
			}
		}

		return moveOptions[0] ?? [];
	};

	const getExpansionMove = (board: string[], validMoves: boolean[][]) => {
		const moveOptions = [];
		const size = board[0].length;

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const isValid = validMoves[i][j];
				const isReserved = i % 2 === 1 || j % 2 === 1;
				const north = i - 1 >= 0 && board[i - 1][j] === "O";
			}
		}
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		do {
			const validMoves = ns.go.analysis.getValidMoves();
			const board = ns.go.getBoardState();

			const move = getRandomMove(board, validMoves);
			if (move.length === 0) {
				result = await ns.go.passTurn();
			} else {
				result = await ns.go.makeMove(move[0], move[1]);
			}

			await ns.go.opponentNextTurn();
			const state = ns.go.getGameState();
			ns.print(`Game scores: ${state.blackScore} - ${state.whiteScore}`);
			await ns.sleep(200);
		} while (result?.type !== "gameOver");
		const state = ns.go.getGameState();
		if (state.blackScore > state.whiteScore) {
			ns.print("Black wins");
		} else {
			ns.print("White wins");
		}
		ns.go.resetBoardState("Netburners", 7);
		ns.print("Starting game...");
		await ns.sleep(200);
	}
}
