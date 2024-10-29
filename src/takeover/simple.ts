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
		const state = ns.go.getBoardState();

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const isValid = validMoves[x][y];
				const isNotReserved = x % 2 === 1 || y % 2 === 1;
				const isNorthFriendly = state[x - 1]?.[y] === "X";
				const isSouthFriendly = state[x + 1]?.[y] === "X";
				const isWestFriendly = state[x]?.[y - 1] === "X";
				const isEastFriendly = state[x]?.[y + 1] === "X";
				const isExpansion =
					isNorthFriendly ||
					isSouthFriendly ||
					isWestFriendly ||
					isEastFriendly;
				if (isValid && isNotReserved && isExpansion) {
					moveOptions.push([x, y]);
				}
			}
		}
		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	};

	const getCaptureMove = (board: string[], validMoves: boolean[][]) => {
		const moveOptions = [];
		const size = board[0].length;
		const liberties = ns.go.analysis.getLiberties();
		const state = ns.go.getBoardState();

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const isValid = validMoves[x][y];
				const northLiberty =
					liberties[x - 1]?.[y] === 1 && state[x - 1]?.[y] === "O";
				const southLiberty =
					liberties[x + 1]?.[y] === 1 && state[x + 1]?.[y] === "O";
				const westLiberty =
					liberties[x]?.[y - 1] === 1 && state[x]?.[y - 1] === "O";
				const eastLiberty =
					liberties[x]?.[y + 1] === 1 && state[x]?.[y + 1] === "O";
				const isLiberty =
					northLiberty || southLiberty || westLiberty || eastLiberty;
				if (isValid && isLiberty) {
					moveOptions.push([x, y]);
				}
			}
		}

		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	};

	const getDefendMove = (board: string[], validMoves: boolean[][]) => {
		const moveOptions = [];
		const size = board[0].length;
		const liberties = ns.go.analysis.getLiberties();
		const state = ns.go.getBoardState();

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const isValid = validMoves[x][y];
				const northLiberty =
					liberties[x - 1]?.[y] === 1 && state[x - 1]?.[y] === "X";
				const southLiberty =
					liberties[x + 1]?.[y] === 1 && state[x + 1]?.[y] === "X";
				const westLiberty =
					liberties[x]?.[y - 1] === 1 && state[x]?.[y - 1] === "X";
				const eastLiberty =
					liberties[x]?.[y + 1] === 1 && state[x]?.[y + 1] === "X";
				const isLiberty =
					northLiberty || southLiberty || westLiberty || eastLiberty;
				if (isValid && isLiberty) {
					moveOptions.push([x, y]);
				}
			}
		}

		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	};
	// eslint-disable-next-line no-constant-condition
	while (true) {
		do {
			const validMoves = ns.go.analysis.getValidMoves();
			const board = ns.go.getBoardState();

			let move = getCaptureMove(board, validMoves);
			if (move.length === 0) {
				move = getExpansionMove(board, validMoves);
			}
			if (move.length === 0) {
				move = getRandomMove(board, validMoves);
			}

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
