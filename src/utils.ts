import * as vis from "vis-network";
import * as _ from "lodash";

import Genome from "../../rane/src/Genome";
import Node from "../../rane/src/Node";
import { NODE_TYPE } from "../../rane/src/Node";
import seedrandom from "seedrandom";

function createPerceptronGenome(...args: any) {
	const seed = args.splice(0, 1)[0];
	const input = args.splice(0, 1)[0];
	const output = args.splice(args.length - 1, args.length)[0];
	const hidden = args;

	const random = seedrandom(seed);

	const genome = new Genome();
	let innovation = 1;

	let id = 0;
	let prevLayer = [] as any;
	for (let i = 0; i < input; i++) {
		prevLayer.push(id);
		genome.addNodeGene(id++, NODE_TYPE.input, 0, "identity", true);
	}

	_.each(hidden, layer => {
		const currentLayer = [] as any;
		for (let i = 0; i < layer; i++) {
			currentLayer.push(id);
			genome.addNodeGene(
				id++,
				NODE_TYPE.hidden,
				random() * 2 - 1,
				"sigmoid",
				true
			);
		}
		_.each(currentLayer, currentLayerId => {
			_.each(prevLayer, prevLayerId => {
				genome.addConnectionGene(
					prevLayerId,
					currentLayerId,
					random() * 2 - 1,
					innovation++,
					true
				);
			});
		});
		prevLayer = currentLayer;
	});

	const currentLayer = [] as any;
	for (let i = 0; i < output; i++) {
		currentLayer.push(id);
		genome.addNodeGene(id++, NODE_TYPE.output, 0, "sigmoid", true);
	}
	_.each(currentLayer, currentLayerId => {
		_.each(prevLayer, prevLayerId => {
			genome.addConnectionGene(
				prevLayerId,
				currentLayerId,
				random() * 2 - 1,
				innovation++,
				true
			);
		});
	});

	return genome;
}

const mazurGenome = new Genome();

mazurGenome.addNodeGene(0, NODE_TYPE.input, 0, "sigmoid", true);
mazurGenome.addNodeGene(1, NODE_TYPE.input, 0, "sigmoid", true);
mazurGenome.addNodeGene(2, NODE_TYPE.hidden, 0.35, "sigmoid", true);
mazurGenome.addNodeGene(3, NODE_TYPE.hidden, 0.35, "sigmoid", true);
mazurGenome.addNodeGene(4, NODE_TYPE.output, 0.6, "sigmoid", true);
mazurGenome.addNodeGene(5, NODE_TYPE.output, 0.6, "sigmoid", true);

let innovation = 1;
mazurGenome.addConnectionGene(0, 2, 0.15, innovation++, true); // w1
mazurGenome.addConnectionGene(1, 2, 0.2, innovation++, true); // w2

mazurGenome.addConnectionGene(0, 3, 0.25, innovation++, true); // w3
mazurGenome.addConnectionGene(1, 3, 0.3, innovation++, true); // w4

mazurGenome.addConnectionGene(2, 4, 0.4, innovation++, true); // w5
mazurGenome.addConnectionGene(3, 4, 0.45, innovation++, true); // w6

mazurGenome.addConnectionGene(2, 5, 0.5, innovation++, true); // w7
mazurGenome.addConnectionGene(3, 5, 0.55, innovation++, true); // w8


const narfGenome = new Genome();
narfGenome.addNodeGene(0, NODE_TYPE.input, .1, "sigmoid", true);
narfGenome.addNodeGene(1, NODE_TYPE.input, .1, "sigmoid", true);
narfGenome.addNodeGene(2, NODE_TYPE.hidden, .1, "sigmoid", true);
narfGenome.addNodeGene(3, NODE_TYPE.hidden, .1, "sigmoid", true);
narfGenome.addNodeGene(4, NODE_TYPE.hidden, .1, "sigmoid", true);
narfGenome.addNodeGene(5, NODE_TYPE.hidden, .1, "sigmoid", true);
narfGenome.addNodeGene(6, NODE_TYPE.hidden, .1, "sigmoid", true);
narfGenome.addNodeGene(7, NODE_TYPE.output, .1, "sigmoid", true);

let blarb = .1;
let inno = 0;
  for (let h = 2; h <= 6; h++) {
    narfGenome.addConnectionGene(h, 7, blarb, ++inno);
    blarb += .1;
  }

  blarb = .1;
  for(let h = 2; h <= 6; h++) {
    for(let i = 0; i <= 1; i++) {
      narfGenome.addConnectionGene(i, h, blarb, ++inno);
      blarb += .1;
    }
  }

export default {
  createPerceptronGenome,
  mazurGenome,
  narfGenome,
	examples: {
		mirror: [
			{ input: [1, 0, 0], output: [1, 0, 0] },
			{ input: [0, 1, 0], output: [0, 1, 0] },
			{ input: [0, 0, 1], output: [0, 0, 1] }
    ],
    mazur: [
      { input: [.05, .10], output: [.01, .99] }
    ],
		X2: [
			{ input: [1], output: [2] },
			{ input: [2], output: [4] },
			{ input: [3], output: [6] },
			{ input: [4], output: [8] },
			{ input: [5], output: [10] },
			{ input: [6], output: [12] }
		],
		AND: [
			{ input: [0.1, 0.1], output: [0.1] },
			{ input: [0.1, 1], output: [0.1] },
			{ input: [1, 0.1], output: [0.1] },
			{ input: [1, 1], output: [1] },
			{ input: [1, 1], output: [1] },
			{ input: [1, 1], output: [1] }
		],
		OR: [
			{ input: [0.1, 0.1], output: [0.1] },
			{ input: [0.1, 0.1], output: [0.1] },
			{ input: [0.1, 0.1], output: [0.1] },
			{ input: [0.1, 1], output: [1] },
			{ input: [1, 0.1], output: [1] },
			{ input: [1, 1], output: [1] }
		],
		XOR: [
			{ input: [0, 1], output: [1] },
			{ input: [0, 0], output: [0] },
			{ input: [1, 0], output: [1] },
			{ input: [1, 1], output: [0] }
		],
		NAND: [
			{ input: [0.1, 0.1], output: [1] },
			{ input: [0.1, 1], output: [1] },
			{ input: [1, 0.1], output: [1] },
			{ input: [1, 1], output: [0.1] }
		],
		NOR: [
			{ input: [0.1, 0.1], output: [1] },
			{ input: [0.1, 1], output: [0.1] },
			{ input: [1, 0.1], output: [0.1] },
			{ input: [1, 1], output: [0.1] }
		],
		XNOR: [
			{ input: [0.1, 0.1], output: [1] },
			{ input: [0.1, 1], output: [0.1] },
			{ input: [1, 0.1], output: [0.1] },
			{ input: [1, 1], output: [1] }
		]
	}
};
