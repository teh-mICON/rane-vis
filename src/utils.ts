import * as vis from "vis-network";
import * as _ from 'lodash';

import Genome from '../../rane/src/Genome'
import Node from '../../rane/src/Node'
import { NODE_TYPE } from '../../rane/src/Node'
import seedrandom from 'seedrandom';

function createPerceptronGenome(...args: any) {
  const seed = args.splice(0, 1)[0];
  const input = args.splice(0, 1)[0];
  const output = args.splice(args.length - 1, args.length)[0];
  const hidden = args;

  const random = seedrandom(seed)

  const genome = new Genome();
  let innovation = 1;

  let id = 0;
  let prevLayer = [] as any;
  for(let i = 0; i < input; i++) {
    prevLayer.push(id);
    genome.addNodeGene(id++, NODE_TYPE.input, 0, 'relu', true);
  }

  _.each(hidden, layer => {
    const currentLayer = [] as any;
    for(let i = 0; i < layer; i++) {
      currentLayer.push(id)
      genome.addNodeGene(id++, NODE_TYPE.hidden, random() * 2 - 1, 'relu', true);
    }
    _.each(currentLayer, currentLayerId => {
      _.each(prevLayer, prevLayerId => {
        genome.addConnectionGene(prevLayerId, currentLayerId, random() * 2 - 1, innovation++, true)
      });
    });
    prevLayer = currentLayer;
  });

  const currentLayer = [] as any;
  for(let i = 0; i < output; i++) {
    currentLayer.push(id)
    genome.addNodeGene(id++, NODE_TYPE.output, 1, 'sigmoid', true);
  }
  _.each(currentLayer, currentLayerId => {
    _.each(prevLayer, prevLayerId => {
      genome.addConnectionGene(prevLayerId, currentLayerId, random() * 2 - 1, innovation++, true)
    });
  });

  return genome;
}

export default {
  createPerceptronGenome,
  examples: {
    mirror: [
      { input: [0, 0, 0], output: [0, 0, 0] },
      { input: [1, 0, 0], output: [1, 0, 0] },
      { input: [0, 1, 0], output: [0, 1, 0] },
      { input: [0, 0, 1], output: [0, 0, 1] }
    ],
    AND: [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [1] },
    ],
    OR: [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] },
    ],
    XOR: [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ],
    NAND: [
      { input: [0, 0], output: [1] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] },
    ],
    NOR: [
      { input: [0, 0], output: [1] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [0] },
    ],
    XNOR: [
      { input: [0, 0], output: [1] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [1] },
    ]    
  }
}