import * as vis from "vis-network";
import * as _ from 'lodash';

import Genome from '../../rane/src/Genome'
import Neuron from '../../rane/src/Neuron'
import { NEURON_TYPE } from '../../rane/src/Neuron'
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
    genome.addNodeGene(id++, NEURON_TYPE.input, 0, 'relu', true);
  }

  _.each(hidden, layer => {
    const currentLayer = [] as any;
    for(let i = 0; i < layer; i++) {
      currentLayer.push(id)
      genome.addNodeGene(id++, NEURON_TYPE.hidden, random() * 2 - 1, 'relu', true);
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
    genome.addNodeGene(id++, NEURON_TYPE.output, random() * 2 - 1, 'relu', true);
  }
  _.each(currentLayer, currentLayerId => {
    _.each(prevLayer, prevLayerId => {
      genome.addConnectionGene(prevLayerId, currentLayerId, random() * 2 - 1, innovation++, true)
    });
  });

  return genome;
}

export default {
  createPerceptronGenome
}