import { NS } from "@ns";

export class MoveGenerator {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	private getAdjacentCords(x: number, y: number) {
		return [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		];
	}

	public getMove(validMoves: boolean[][]) {
		const moves = this.checkMoves(this.ns.go.getBoardState(), validMoves);
		return moves;
	}

	public checkMoves(board: string[], validMoves: boolean[][]) {
		const moveOptions: FoundMove[] = [];
		const size = board[0].length;

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const isNotReserved = i % 2 === 1 || j % 2 === 1;
				const isValid = validMoves[i][j];
				if(!isValid || !isNotReserved) {
					continue;
				}
				const smotheringScore = this.checkSmothering(board, validMoves, i, j);
				const expansionScore = this.checkExpansion(board, validMoves, i, j);
				const captureScore = this.checkCapture(board, validMoves, i, j);
				const defendScore = this.checkDefend(board, validMoves, i, j) * 2;
				const score = (smotheringScore + expansionScore + captureScore + defendScore);
				moveOptions.push({ x: i, y: j, score });
			}
		}

		return moveOptions.sort((a, b) => a.score - b.score);
	}

	public checkSmothering(board: string[], validMoves: boolean[][], x: number, y: number): number {
		let networks = this.getAdjacentNetworks(x, y, "O");
		if(networks.length > 0) {
			networks = networks.sort((a, b) => a.liberties - b.liberties);
			const weakest = networks[0];
			const isSmothering = weakest.liberties < 3;
			if (isSmothering) {
				return weakest.size;
			}
		}
		return 0;
	}

	public checkExpansion(board: string[], validMoves: boolean[][], x: number, y: number): number {
		let networks = this.getAdjacentNetworks(x, y, "X");
		if(networks.length > 0) {
			networks = networks.sort((a, b) => a.size - b.size);
			const isExpansion = networks.length > 0;
			if (isExpansion) {
				return networks[0].size;
			}
		}
		return 0;
	}

	public checkCapture(board: string[], validMoves: boolean[][], x: number, y: number): number {
		const networks = this.getAdjacentNetworks(x, y, "0");
		if(networks.length > 0) {
			const weakest = networks.sort((a, b) => a.liberties - b.liberties)[0];
			if (weakest.liberties < 2) {
				return weakest.size;
			}
		}
		return 0;
	}

	public checkDefend(board: string[], validMoves: boolean[][], x: number, y: number): number {
		const networks = this.getAdjacentNetworks(x, y, "X");
		if(networks.length > 0) {
			const weakest = networks.sort((a, b) => a.liberties - b.liberties)[0];
			if (weakest.liberties < 2) {
				return weakest.size;
			}
		}
		return 0;
	}

	public adjacentNetworksWithLiberties(
		x: number,
		y: number,
		color = "X",
		libertieCount = 1
	) {
		const liberties = this.ns.go.analysis.getLiberties();
		const state = this.ns.go.getBoardState();
		let numLiberties = 0;
		for (const [_x, _y] of this.getAdjacentCords(x, y)) {
			if (state[x]?.[y] === color) {
				if (liberties[_x]?.[_y] === libertieCount && state[_x]?.[_y] === color) {
					numLiberties++;
				}
			}
		}
		return numLiberties;
	}

	

	public getSafeNetwork(
		x: number,
		y: number,
		color = "X"
	) {
		const liberties = this.ns.go.analysis.getLiberties();
		const state = this.ns.go.getBoardState();
		let mostLiberties = 0;
		let largestNetworkCords: number[] = [];
		for (const [_x, _y] of this.getAdjacentCords(x, y)) {
			if (state[_x]?.[_y] === color) {
				if (liberties[_x]?.[_y] > mostLiberties) {
					mostLiberties = liberties[_x]?.[_y];
					largestNetworkCords = [_x, _y];
				}
			}
		}
		return { largestNetworkCords, mostLiberties };
	}

	public getAdjacentNumber(x: number, y: number, color = "X") {
		let numAdjacent = 0;
		const state = this.ns.go.getBoardState();
		for (const [_x, _y] of this.getAdjacentCords(x, y)) {
			if (state[_x]?.[_y] === color) {
				numAdjacent++;
			}
		}
		return numAdjacent;
	}

	public getAdjacentNetworks(x: number, y: number, color = "X") {
		const networks: Network[] = [];
		const liberties = this.ns.go.analysis.getLiberties();
		const state = this.ns.go.getBoardState();
		for (const [_x, _y] of this.getAdjacentCords(x, y)) {
			if (state[_x]?.[_y] === color) {
				const network = {
					x: _x,
					y: _y,
					liberties: liberties[_x]?.[_y],
					color,
					size: this.getNetworkSize(_x, _y),
				};
				networks.push(network);
			}
		}
		return networks;
	}

	public getNetworkSize(x: number, y: number) {
		const chains = this.ns.go.analysis.getChains();
		const targeNetwork = chains[x]?.[y];
		if (!targeNetwork) {
			return 0;
		}
		let size = 0;
		for (let x = 0; x < chains.length; x++) {
			for (let y = 0; y < chains[x].length; y++) {
				if (chains[x]?.[y] === targeNetwork) {
					size++;
				}
			}
		}
		return size;
	}
}

export interface FoundMove {
	x: number;
	y: number;
	score: number;
}

export interface Network {
	x: number;
	y: number;
	liberties: number;
	color: string;
	size: number;
}
