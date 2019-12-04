import * as vis from "vis-network";
import * as _ from 'lodash';

import Genome from '../../rane/src/Genome'
import Bias from '../../rane/src/Bias'
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
  const biasInput = new Bias('input', 0);
  for(let i = 0; i < input; i++) {
    prevLayer.push(id);
    genome.addNodeGene(id++, NODE_TYPE.input, biasInput, 'identity', true);
  }

  _.each(hidden, (layer, layerId) => {
    const currentLayer = [] as any;
    const bias = new Bias('hidden' + layerId, random() * 2 - 1);
    for(let i = 0; i < layer; i++) {
      currentLayer.push(id)
      genome.addNodeGene(id++, NODE_TYPE.hidden, bias, 'sigmoid', true);
    }
    _.each(currentLayer, currentLayerId => {
      _.each(prevLayer, prevLayerId => {
        genome.addConnectionGene(prevLayerId, currentLayerId, random() * 2 - 1, innovation++, 1, true)
      });
    });
    prevLayer = currentLayer;
  });

  const currentLayer = [] as any;
  const outputBias = new Bias('output', 0);
  for(let i = 0; i < output; i++) {
    currentLayer.push(id)
    genome.addNodeGene(id++, NODE_TYPE.output, outputBias, 'relu', true);
  }
  _.each(currentLayer, currentLayerId => {
    _.each(prevLayer, prevLayerId => {
      genome.addConnectionGene(prevLayerId, currentLayerId, random() * 2 - 1, innovation++, 1, true)
    });
  });

  return genome;
}

export default {
  createPerceptronGenome,
  examples: {
    mirror: [
      { input: [1, 0, 0], output: [1, 0, 0] },
      { input: [0, 1, 0], output: [0, 1, 0] },
      { input: [0, 0, 1], output: [0, 0, 1] },
    ],
    X2: [
      {input: [1], output: [2] },
      {input: [2], output: [4] },
      {input: [3], output: [6] },
      {input: [4], output: [8] },
      {input: [5], output: [10] },
      {input: [6], output: [12] },
    ],
    AND: [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [0] },
      { input: [1, 1], output: [1] },
      { input: [1, 1], output: [1] },
      { input: [1, 1], output: [1] },
    ],
    OR: [
      { input: [0, 0], output: [0] },
      { input: [0, 0], output: [0] },
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