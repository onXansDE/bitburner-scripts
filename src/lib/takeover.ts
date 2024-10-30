import { NS } from "@ns";

export class SubNethandler {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	public getMove(board: string[], validMoves: boolean[][]) {
		let moves = this.getDefendMove(board, validMoves);
		if (moves.length === 0) {
			moves = this.getCaptureMove(board, validMoves);
		}
		if (moves.length === 0) {
			moves = this.getExpansionMove(board, validMoves);
		}

		if (moves.length === 0) {
			moves = this.getRandomMove(board, validMoves);
		}
		return moves;
	}

	public getRandomMove(board: string[], validMoves: boolean[][]) {
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

		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	}

	public getExpansionMove(board: string[], validMoves: boolean[][]) {
		const moveOptions = [];
		const size = board[0].length;
		const state = this.ns.go.getBoardState();

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
	}

	public getCaptureMove(board: string[], validMoves: boolean[][]) {
		const moveOptions = [];
		const size = board[0].length;
		const liberties = this.ns.go.analysis.getLiberties();
		const state = this.ns.go.getBoardState();

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const isValid = validMoves[x][y];
				const isLiberty =
					this.countAdjacentLiberties(liberties, state, x, y, "O") > 0;
				if (isValid && isLiberty) {
					moveOptions.push([x, y]);
				}
			}
		}

		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	}

	public getDefendMove(board: string[], validMoves: boolean[][]) {
		const moveOptions = [];
		const size = board[0].length;
		const liberties = this.ns.go.analysis.getLiberties();
		const state = this.ns.go.getBoardState();

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < size; y++) {
				const isValid = validMoves[x][y];
				const isLiberty =
					this.countAdjacentLiberties(liberties, state, x, y, "X", 1) > 0;
				const canDefend = this.getAdjacentNumber(state, x, y, ".") > 1;
				const saveNetworkLoc = this.getSafeNetwork(liberties, state, x, y);
				if (isValid && isLiberty) {
					if (saveNetworkLoc.mostLiberties > 3 || canDefend) {
						moveOptions.push([x, y]);
					}
				}
			}
		}

		const randomIndex = Math.floor(Math.random() * moveOptions.length);
		return moveOptions[randomIndex] ?? [];
	}

	public countAdjacentLiberties(
		liberties: number[][],
		state: string[],
		x: number,
		y: number,
		color = "X",
		libertieCount = 1
	) {
		let numLiberties = 0;
		if (liberties[x - 1]?.[y] === libertieCount && state[x - 1]?.[y] === color)
			numLiberties++;
		if (liberties[x + 1]?.[y] === libertieCount && state[x + 1]?.[y] === color)
			numLiberties++;
		if (liberties[x]?.[y - 1] === libertieCount && state[x]?.[y - 1] === color)
			numLiberties++;
		if (liberties[x]?.[y + 1] === libertieCount && state[x]?.[y + 1] === color)
			numLiberties++;
		return numLiberties;
	}

	public getSafeNetwork(
		liberties: number[][],
		state: string[],
		x: number,
		y: number
	) {
		let mostLiberties = 0;
		let largestNetworkCords: number[] = [];
		const color = "X";
		if (state[x - 1]?.[y] === color) {
			if (liberties[x - 1]?.[y] > mostLiberties) {
				mostLiberties = liberties[x - 1]?.[y];
				largestNetworkCords = [x - 1, y];
			}
		}
		if (state[x + 1]?.[y] === color) {
			if (liberties[x + 1]?.[y] > mostLiberties) {
				mostLiberties = liberties[x + 1]?.[y];
				largestNetworkCords = [x + 1, y];
			}
		}
		if (state[x]?.[y - 1] === color) {
			if (liberties[x]?.[y - 1] > mostLiberties) {
				mostLiberties = liberties[x]?.[y - 1];
				largestNetworkCords = [x, y - 1];
			}
		}
		if (state[x]?.[y + 1] === color) {
			if (liberties[x]?.[y + 1] > mostLiberties) {
				mostLiberties = liberties[x]?.[y + 1];
				largestNetworkCords = [x, y + 1];
			}
		}
		return { largestNetworkCords, mostLiberties };
	}

	public getAdjacentNumber(state: string[], x: number, y: number, color = "X") {
		let numAdjacent = 0;
		if (state[x - 1]?.[y] === color) numAdjacent++;
		if (state[x + 1]?.[y] === color) numAdjacent++;
		if (state[x]?.[y - 1] === color) numAdjacent++;
		if (state[x]?.[y + 1] === color) numAdjacent++;
		return numAdjacent;
	}
}
