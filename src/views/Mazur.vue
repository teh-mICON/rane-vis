<template>
	<div>
		<Graph :genome="genome" v-if="genome" />
		<Genome :genome="genome" v-if="genome" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import GraphComponent from "../components/graph.vue";
import GenomeComponent from "../components/genome.vue";
import utils from "../utils";

import _ from "lodash";

import Network from "../../../rane/src/Network";
import { NEURON_TYPE } from "../../../rane/src/Neuron";
import Genome from "../../../rane/src/Genome";
import Memory from "../../../rane/src/Memory";

// https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/
export default Vue.extend({
	name: "app",

	components: {
		Graph: GraphComponent,
		Genome: GenomeComponent
	},

	data() {
		return { genome: null as any };
	},
	async created() {
		document.title = "mazur";

		const genome = new Genome();

		genome.addNodeGene(0, NEURON_TYPE.input, 0, "sigmoid", true);
		genome.addNodeGene(1, NEURON_TYPE.input, 0, "sigmoid", true);
		genome.addNodeGene(2, NEURON_TYPE.hidden, 0.35, "sigmoid", true);
		genome.addNodeGene(3, NEURON_TYPE.hidden, 0.35, "sigmoid", true);
		genome.addNodeGene(4, NEURON_TYPE.output, 0.6, "sigmoid", true);
		genome.addNodeGene(5, NEURON_TYPE.output, 0.6, "sigmoid", true);

		let innovation = 1;
		genome.addConnectionGene(0, 2, 0.15, innovation++, true); // w1
		genome.addConnectionGene(1, 2, 0.2, innovation++, true); // w2

		genome.addConnectionGene(0, 3, 0.25, innovation++, true); // w3
		genome.addConnectionGene(1, 3, 0.3, innovation++, true); // w4

		genome.addConnectionGene(2, 4, 0.4, innovation++, true); // w5
		genome.addConnectionGene(3, 4, 0.45, innovation++, true); // w6

		genome.addConnectionGene(2, 5, 0.5, innovation++, true); // w7
		genome.addConnectionGene(3, 5, 0.55, innovation++, true); // w8

		let network = new Network(
			{ input: 2, output: 2, learningRate: 0.5 },
			genome
		);

		const input = [0.05, 0.1];
		const output = [0.01, 0.99];
		//const output = [0, 1]

		let result = network.activate(input);

		let error = 0;
		_.each(output, (value, index) => {
			error += 0.5 * Math.pow(value - result[index], 2);
		});
		console.log("BEFORE", { output, result, error });

    network.train({input, output});

		result = network.activate(input);
		error = 0;
		_.each(output, (value, index) => {
			error += 0.5 * Math.pow(value - result[index], 2);
		});
		console.log("AFTER", { output, result, error });

		this.genome = network.getGenome();
	},
	methods: {}
});
</script>

<style>
body {
	background: #111;
	color: #eee;
}
</style>
