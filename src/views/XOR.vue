<template>
	<Graph :genome="genome" v-if="genome" />
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "../components/graph.vue";
import utils from "../utils";

import _ from "lodash";

import Network from "../../../rane/src/Network";
import Memory from "../../../rane/src/Memory";

export default Vue.extend({
	name: "app",

	components: {
		Graph
	},

	data() {
		return { genome: null as any };
	},
	async created() {
		this.genome = utils.createPerceptronGenome(2, 2, 2, 2, 2, 1);
		const network = new Network({}, this.genome);

		const XOR = [
			{ input: [0, 0], output: [0] },
			{ input: [0, 1], output: [1] },
			{ input: [1, 0], output: [1] },
			{ input: [1, 1], output: [0] }
		];

		let error = 0;
		for (let i = 0; i < 10000; i++) {
			_.each(XOR, example => {
				network.activate(example.input);
				let memory = new Memory();
				_.each(example.output, (value, index) => {
					const neuron = network.getOutputNeurons()[index];
					const derivativeErrorOutput = -(
						example.output[index] - neuron.getActivation()
					);
					neuron.propagate(derivativeErrorOutput, memory);
				});

				memory = new Memory();
				_.each(network.getOutputNeurons(), neuron => {
					neuron.adjust(memory);
				});
			});
			if (i % 1000 == 0) {
				console.log("updating");
				this.genome = network.getGenome();
			}
		}

		_.each(XOR, example => {
			const result = network.activate(example.input);
			console.log("XOR", example.input, example.output[0], result);
    });
    
    console.log('testing random XOR 1, 0', network.activate([1, 0]));

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
