<template>
	<div>
		<table id="result">
			<tr v-for="(example, key) in examples" :key="key">
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
import mnist from "mnist";

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
		const MSE = false;
		document.title = "MNIST2";

		const set = mnist.set(9950, 50);

		this.genome = utils.createPerceptronGenome("MNIST", 784, 16, 16, 10);
		const network = new Network({}, this.genome);

		for (let i = 0; i < 10; i++) {
			this.examples = [] as any;
			let errors = Array(set.training[0].input).fill(0);
			let doBreak = false;
			_.each(set.training, (example, exampleIndex) => {
        if(exampleIndex % 100 == 0) console.log('iteration / example', i, '/', exampleIndex)
        network.train(example)
			});
			this.genome = network.getGenome();
		}
		const getMaxKey = set => {
			let error = 0;
			let maxValue = 0;
			let maxKey;
			const max = (value, key) => {
				if (value >= maxValue) {
					maxValue = value;
					maxKey = key;
				}
			};
			_.each(set, max);
			return maxKey;
		};
		_.each(set.test, example => {
      const result = network.activate(example.input);

			this.examples.push({
				output: getMaxKey(example.output),
				result: getMaxKey(result)
			});
		});
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
