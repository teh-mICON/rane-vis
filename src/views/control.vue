<template>
	<div :key="frame">
		<Graph :network="graphNetwork" v-if="graphNetwork" />
		<table id="result">
			<tr v-for="(result, index) in results" :key="index">
				<td class="input">{{result.input}}</td>
				<td class="ideal">{{result.ideal}}</td>
				<td class="actual">{{result.actual}}</td>
			</tr>
		</table>
		<div id="loss">{{epoch}}: {{loss}}</div>
		<div class="btn-group" role="group" aria-label="Basic example">
			<button type="button" class="btn btn-secondary" @click="setExample('mirror')">mirror</button>
			<button type="button" class="btn btn-secondary" @click="setExample('X2')">X2</button>
			<button type="button" class="btn btn-secondary" @click="setExample('AND')">AND</button>
			<button type="button" class="btn btn-secondary" @click="setExample('OR')">OR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('XOR')">XOR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('NAND')">NAND</button>
			<button type="button" class="btn btn-secondary" @click="setExample('NOR')">NOR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('XNOR')">XNOR</button>
		</div>
		<div class="input-group mb-3">
			<div class="input-group-prepend">
				<button type="button" class="btn btn-primary" @click="resetErrors">resetErrors</button>
				<button @click="goesX" class="btn btn-primary" type="button">GOES</button>
			</div>
			<input
				type="text"
				class="form-control"
				placeholder
				aria-label
				aria-describedby="basic-addon1"
				v-model="goestimes"
			/>
		</div>
		<div class="btn-group" role="group">
			<button type="button" class="btn btn-primary" @click="pause">Pause</button>
			<button type="button" class="btn btn-primary" @click="resume">resume</button>
		</div>
		<Errors :errors="errors" v-if="errors" />
		<Genome :genome="genome" v-if="genome" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "../components/graph.vue";
import Genome from "../components/genome.vue";
import Errors from "../components/errors.vue";

import utils from "../utils";
import Squash from "../../../rane/src/Squash";

import _ from "lodash";

import Network from "../../../rane/src/Network";

function normalize(low, high, value) {
	return (value - low) / (high - low);
}
function denormalize(low, high, value) {
	return +low + value * (high - low);
}

export default Vue.extend({
	name: "app",

	components: {
		Graph,
		Genome,
		Errors
	},

	data() {
		return {
			network: null as Network,
			graphNetwork: null as any,
			normalize: false,
			examples: utils.examples.XOR,
			genome: null,
			results: [],
			frame: 0,
			goestimes: 1000000,
			loss: 0,
			errors: [],
			epoch: 0,
			runFunc: null,
			timeout: null
		};
	},
	async created() {
		document.title = "rane 0-3";
		this.setExample("XOR");
		this.updateDisplay(0);
	},
	methods: {
		pause() {
			window.clearTimeout(this.timeout);
		},
		resume() {
			window.setTimeout(this.runFunc, 1);
		},
		resetErrors() {
			this.errors = [];
		},
		setExample(index) {
			this.normalize = false;
			if (index == "X2") {
				this.normalize = true;
			}
			this.resetErrors();
			this.examples = utils.examples[index];
			if (index == "mirror") {
				this.genome = utils.createPerceptronGenome("relu", 3, 6, 6, 3);
				this.network = new Network({ learningRate: 0.01 }, this.genome);
				this.network.activate(this.examples[0].input);
				this.genome = this.network.getGenome();
				this.frame++;
			} else if (index == "X2") {
				this.genome = utils.createPerceptronGenome("relu", 1, 6, 6, 1);
				this.network = new Network({ learningRate: 0.001 }, this.genome);
				this.network.activate(this.examples[0].input);
				this.genome = this.network.getGenome();
			} else {
				this.genome = utils.createPerceptronGenome("relu", 2, 5, 5, 1);
				this.network = new Network({ learningRate: 0.1 }, this.genome);
				this.network.activate(this.examples[0].input);
				this.genome = this.network.getGenome();
				this.frame++;
			}
		},

		updateDisplay(epoch) {
			const results = [];
			let loss = 0;
			_.each(this.examples, example => {
				// activate network
				const actual = this.network.activate(example.input);

				// add every error to the MSE
				_.each(example.output, (ideal, index) => {
					loss += Math.pow(actual[index] - ideal, 2);
				});

				// add result to display
				results.push({
					input: this.normalize ? denormalize(1, 6, example.input) : example.input,
					ideal: this.normalize ? denormalize(2, 12, example.output) : example.output,
					actual: this.normalize ? denormalize(2, 12, actual) : Math.round(+actual * 1000000) / 1000000
				});
			});

			// finally set all display properties
			this.loss = loss * 0.5;
			this.graphNetwork = this.network;
			this.genome = this.network.getGenome();
			this.results = results;
			this.errors.push(this.loss);
			this.frame++;
			this.epoch = epoch;
		},

		goesX() {
			let i = 0;

			// create initial state to display
			// main goes loop
			const batch = 1000;
			const goes = () => {
				for (let j = 0; j < batch; j++) {
					// train the network for a random example
					const example = _.sample(this.examples);
					this.network.train(example);
				}
				i += batch;

				this.updateDisplay(i);

				if (i > 0 && this.loss > 0.0001 && i < this.goestimes) {
					this.timeout = window.setTimeout(goes, 1);
				}
			};
			this.timeout = window.setTimeout(goes, 10);
			this.runFunc = goes;
		}
	}
});
</script>

<style>
html body {
	background-color: #111;
	color: #eee;
}
input[type="text"] {
	background-color: black;
	color: #ddd;
	border: 0;
}
html pre {
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
