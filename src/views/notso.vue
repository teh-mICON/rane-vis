<template>
	<div>
		<Graph :genome="genome" v-if="genome" />
		<Errors :errors="errors" v-if="errors" />
		<Genome :genome="genome" v-if="genome" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import GraphComponent from "../components/graph.vue";
import GenomeComponent from "../components/genome.vue";
import ErrorsComponent from "../components/errors.vue";
import utils from "../utils";

import _ from "lodash";

import Network from "../../../rane/src/Network";
import Bias from "../../../rane/src/Bias";
import { NODE_TYPE } from "../../../rane/src/Node";
import Genome from "../../../rane/src/Genome";
import Memory from "../../../rane/src/Memory";
import Log from "../../../rane/src/Log";

// https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/
export default Vue.extend({
	name: "app",

	components: {
		Graph: GraphComponent,
		Genome: GenomeComponent,
		Errors: ErrorsComponent
	},

	data() {
		return { genome: null as any, errors: null as any };
	},
	async created() {
		document.title = "mazur";

		const genome = new Genome();
		const emptyBias = new Bias(0);
		const bias1 = new Bias('one', 0.5);
		const bias2 = new Bias('two', 0.5);

		genome.addNodeGene(0, NODE_TYPE.input, emptyBias, "identity", true);
		genome.addNodeGene(1, NODE_TYPE.input, emptyBias, "identity", true);
		genome.addNodeGene(2, NODE_TYPE.input, emptyBias, "identity", true);
		genome.addNodeGene(3, NODE_TYPE.hidden, bias1, "sigmoid", true);
		genome.addNodeGene(4, NODE_TYPE.hidden, bias1, "sigmoid", true);
		genome.addNodeGene(5, NODE_TYPE.output, bias2, "sigmoid", true);
		genome.addNodeGene(6, NODE_TYPE.output, bias2, "sigmoid", true);

		let innovation = 1;
		genome.addConnectionGene(0, 3, 0.1, innovation++, 1, true); // w1
		genome.addConnectionGene(0, 4, 0.2, innovation++, 1, true); // w2

		genome.addConnectionGene(1, 3, 0.3, innovation++, 1, true); // w3
		genome.addConnectionGene(1, 4, 0.4, innovation++, 1, true); // w4

		genome.addConnectionGene(2, 3, 0.5, innovation++, 1, true); // w5
		genome.addConnectionGene(2, 4, 0.6, innovation++, 1, true); // w6

		genome.addConnectionGene(3, 5, 0.7, innovation++, 1, true); // w7
		genome.addConnectionGene(3, 6, 0.8, innovation++, 1, true); // w8

		genome.addConnectionGene(4, 5, 0.9, innovation++, 1, true); // w9
		genome.addConnectionGene(4, 6, 0.1, innovation++, 1, true); // w10

		let network = new Network(
			{ input: 2, output: 2, learningRate: 0.01 },
			genome
		);

		const input = [1, 4, 5];
		const output = [0.7, 0.1];
		//const output = [0, 1]

		let result = network.activate(input);

		const errors = [];

		Log.setTypes(Log.type.WEIGHTS | Log.type.HIDDEN);

    // INTIAL ACTIVATION
		let error = 0;
		_.each(output, (value, index) => {
			error += Math.pow(value - result[index], 2);
		});
		error *= 0.5;
		errors.push(error);
		console.log("BEFORE", { output, result, error });

    // FIRST TRAINING ROUND
    result = network.train({ input, output });
		error = 0;
		_.each(output, (value, index) => {
			error += Math.pow(value - result[index], 2);
		});
		error *= 0.5;
		errors.push(error);
		console.log("AFTER", { output, result, error });

    // HARDCORE TRAINING
		Log.setTypes(0);
		for (let i = 0; i < 3000; i++) {
			result = network.train({ input, output });

			error = 0;
			_.each(output, (value, index) => {
				error += Math.pow(value - result[index], 2);
			});
			error *= 0.5;
			errors.push(error);
		}
		console.log("FINAL", { input, output, result, error });

		this.errors = errors;

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
