<template>
	<div>
		<Graph :genome="genome" v-if="genome" />
		<table id="result">
			<tr v-for="example in examples" :key="example.id">
				<td class="input">{{example.input[0]}}</td>
				<td class="input">{{example.input[1]}}</td>
				<td class="output">{{example.output}}</td>
				<td class="result">{{example.result}}</td>
			</tr>
		</table>
		<Genome :genome="genome" v-if="genome" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "../components/graph.vue";
import Genome from "../components/genome.vue";
import utils from "../utils";

import _ from "lodash";

import Network from "../../../rane/src/Network";
import Memory from "../../../rane/src/Memory";

export default Vue.extend({
	name: "app",

	components: {
		Graph,
		Genome
	},

	data() {
		return { genome: null as any, examples: null as any };
	},
	async created() {
		document.title = "XOR";
    this.genome = utils.createPerceptronGenome("XORinho", 2, 10, 1);
    
    const network = new Network({learningRate: .5}, this.genome);

		const XOR = [
			{ input: [0, 0], output: [0] },
			{ input: [0, 1], output: [1] },
			{ input: [1, 0], output: [1] },
			{ input: [1, 1], output: [0] },
		];

		let error = 0;
		for (let i = 0; i < 100000; i++) {
			this.examples = [] as any;
			_.each(XOR, example => {
        network.train(example);
			});
		}
    this.genome = network.getGenome();
		_.each(XOR, example => {
			const result = network.activate(example.input);
      this.examples.push({
        input: example.input,
        output: example.output[0],
        result: result[0]
      });
		});
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
#result {
	font-family: "Consolas";
	margin: 0 auto;
}
#result td {
	border: 1px solid #333;
}
#result .input {
	color: yellow;
}
#result .output {
	color: #aaa;
}
#result .result {
	color: white;
}
</style>
