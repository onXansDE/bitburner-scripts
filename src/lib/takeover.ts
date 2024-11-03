import { NS } from "@ns";

export class MoveGenerator {
	private ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}

	private calculateAdjacentCoordinates(
		x: number,
		y: number
	): [number, number][] {
		const size = this.ns.go.getBoardState().length;
		const potentialCoords: [number, number][] = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		];

		return potentialCoords.filter(
			([adjX, adjY]) =>
				adjX >= 0 && adjX < size && adjY >= 0 && adjY < size
		);
	}

	public getMove(validMoves: boolean[][]): FoundMove[] {
		const board = this.ns.go.getBoardState();
		const liberties = this.ns.go.analysis.getLiberties();
		const chains = this.ns.go.analysis.getChains();

		const moves = this.evaluateMoves(board, validMoves, liberties, chains);
		return moves;
	}

	private evaluateMoves(
		board: string[],
		validMoves: boolean[][],
		liberties: number[][],
		chains: (number | null)[][]
	): FoundMove[] {
		const moveOptions: FoundMove[] = [];
		const size = board.length;

		for (let x = 0; x < size; x++) {
			for (let y = 0; y < board[x].length; y++) {
				if (!validMoves[x][y]) continue;

				const captureScore =
					this.checkCapture(board, liberties, chains, x, y) * 30;
				if (captureScore > 0) {
					moveOptions.push({ x, y, score: captureScore });
					continue;
				}
				const defenseScore =
					this.checkDefend(board, liberties, chains, x, y) * 20;
				if (defenseScore > 0) {
					moveOptions.push({ x, y, score: defenseScore });
					continue;
				}
				if (y % 2 === 0 && x % 2 === 0) continue;
				const expansionScore = this.checkExpansion(
					board,
					liberties,
					chains,
					x,
					y
				);
				const territoryScore = this.checkTerritory(board, x, y) * 1.5;
				const smotheringScore =
					this.checkSmothering(board, liberties, chains, x, y) * 1.2;
				const score = expansionScore + territoryScore + smotheringScore;
				if (score > 0) {
					moveOptions.push({ x, y, score: score });
				}
			}
		}

		return moveOptions.sort((a, b) => b.score - a.score);
	}

	private checkTerritory(board: string[], x: number, y: number): number {
		const controlledNodes = this.ns.go.analysis.getControlledEmptyNodes();
		const size = controlledNodes.length;
		let territoryScore = 0;

		for (const [adjX, adjY] of this.calculateAdjacentCoordinates(x, y)) {
			if (
				adjX >= 0 &&
				adjX < size &&
				adjY >= 0 &&
				adjY < controlledNodes[adjX].length &&
				controlledNodes[adjX][adjY] === "?"
			) {
				// This move can help secure contested territory
				territoryScore += 1;
			}
		}

		return territoryScore;
	}

	public checkSmothering(
		board: string[],
		liberties: number[][],
		chains: (number | null)[][],
		x: number,
		y: number
	): number {
		// Get adjacent networks of opponent stones
		const opponentNetworks = this.getAdjacentNetworks(
			board,
			liberties,
			chains,
			x,
			y,
			"O"
		);

		if (opponentNetworks.length > 0) {
			// Sort networks by the number of liberties in ascending order
			opponentNetworks.sort((a, b) => a.liberties - b.liberties);

			const weakestNetwork = opponentNetworks[0];
			const isSmothering = weakestNetwork.liberties < 3;

			if (isSmothering) {
				return weakestNetwork.size;
			}
		}

		return 0;
	}

	public checkExpansion(
		board: string[],
		liberties: number[][],
		chains: (number | null)[][],
		x: number,
		y: number
	): number {
		// Get adjacent networks of player's stones
		const playerNetworks = this.getAdjacentNetworks(
			board,
			liberties,
			chains,
			x,
			y,
			"X"
		);

		if (playerNetworks.length > 0) {
			// Sort networks by size in ascending order
			playerNetworks.sort((a, b) => a.size - b.size);

			const smallestNetwork = playerNetworks[0];
			return smallestNetwork.size;
		}

		return 0;
	}

	public checkCapture(
		board: string[],
		liberties: number[][],
		chains: (number | null)[][],
		x: number,
		y: number
	): number {
		const networks = this.getAdjacentNetworks(
			board,
			liberties,
			chains,
			x,
			y,
			"0"
		);
		if (networks.length > 0) {
			const weakest = networks.sort(
				(a, b) => a.liberties - b.liberties
			)[0];
			if (weakest.liberties < 2) {
				return weakest.size;
			}
		}
		return 0;
	}

	public checkDefend(
		board: string[],
		liberties: number[][],
		chains: (number | null)[][],
		x: number,
		y: number
	): number {
		const networks = this.getAdjacentNetworks(
			board,
			liberties,
			chains,
			x,
			y,
			"X"
		);
		if (networks.length > 0) {
			const weakest = networks.sort(
				(a, b) => a.liberties - b.liberties
			)[0];
			if (weakest.liberties < 2) {
				return weakest.size;
			}
		}
		return 0;
	}

	public adjacentNetworksWithLiberties(
		state: string[][],
		liberties: number[][],
		x: number,
		y: number,
		color = "X",
		libertieCount = 1
	) {
		let numLiberties = 0;
		for (const [_x, _y] of this.calculateAdjacentCoordinates(x, y)) {
			if (state[x]?.[y] === color) {
				if (
					liberties[_x]?.[_y] === libertieCount &&
					state[_x]?.[_y] === color
				) {
					numLiberties++;
				}
			}
		}
		return numLiberties;
	}

	public getSafeNetwork(
		state: string[][],
		liberties: number[][],
		x: number,
		y: number,
		color = "X"
	) {
		let mostLiberties = 0;
		let largestNetworkCords: number[] = [];
		for (const [_x, _y] of this.calculateAdjacentCoordinates(x, y)) {
			if (state[_x]?.[_y] === color) {
				if (liberties[_x]?.[_y] > mostLiberties) {
					mostLiberties = liberties[_x]?.[_y];
					largestNetworkCords = [_x, _y];
				}
			}
		}
		return { largestNetworkCords, mostLiberties };
	}

	public getAdjacentNumber(
		state: string[][],
		x: number,
		y: number,
		color = "X"
	) {
		let numAdjacent = 0;
		for (const [_x, _y] of this.calculateAdjacentCoordinates(x, y)) {
			if (state[_x]?.[_y] === color) {
				numAdjacent++;
			}
		}
		return numAdjacent;
	}

	public getAdjacentNetworks(
		state: string[],
		liberties: number[][],
		chains: (number | null)[][],
		x: number,
		y: number,
		color = "X"
	) {
		const networks: Network[] = [];
		for (const [_x, _y] of this.calculateAdjacentCoordinates(x, y)) {
			if (state[_x]?.[_y] === color) {
				const network = {
					x: _x,
					y: _y,
					liberties: liberties[_x]?.[_y],
					color,
					size: this.getNetworkSize(chains,_x, _y),
				};
				networks.push(network);
			}
		}
		return networks;
	}

	public getNetworkSize(chains: (number | null)[][], x: number, y: number) {
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
