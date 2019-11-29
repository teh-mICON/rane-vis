<template>
	<div :key="frame">
		<Graph :genome="genome" v-if="genome" />
		<table id="result">
			<tr v-for="(result, index) in results" :key="index">
				<td class="input">{{result.input}}</td>
				<td class="ideal">{{result.ideal}}</td>
				<td class="actual">{{result.actual}}</td>
			</tr>
		</table>
		<div id="loss">{{loss}}</div>
		<div class="input-group mb-3">
			<div class="input-group-prepend">
				<button @click="goes" class="btn btn-primary">GOES</button>
				<button @click="goesAll" class="btn btn-primary">GOESALL</button>
				<button @click="goesX" class="btn btn-primary" type="button">GOES ALL X</button>
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
		<div class="btn-group" role="group" aria-label="Basic example">
			<button type="button" class="btn btn-secondary" @click="setExample('mirror')">mirror</button>
			<button type="button" class="btn btn-secondary" @click="setExample('AND')">AND</button>
			<button type="button" class="btn btn-secondary" @click="setExample('OR')">OR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('XOR')">XOR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('NAND')">NAND</button>
			<button type="button" class="btn btn-secondary" @click="setExample('NOR')">NOR</button>
			<button type="button" class="btn btn-secondary" @click="setExample('XNOR')">XNOR</button>
		</div>
		<Genome :genome="genome" v-if="genome" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "../components/graph.vue";
import Genome from "../components/genome.vue";
import utils from "../utils";
import Squash from '../../../rane/src/Squash'

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
		return {
			network: null as Network,
			genome: null as any,
			examples: utils.examples.mirror,
			exampleIterator: 0,
			results: [],
			frame: 0,
			goestimes: 100,
			loss: 0
		};
	},
	async created() {
		document.title = "rane 0-3";
		this.genome = utils.createPerceptronGenome("mirror", 3, 6, 6, 3);
		this.network = new Network({ learningRate: .1 }, this.genome);
		this.network.activate(this.examples[0].input);
    this.genome = this.network.getGenome();
	},
	methods: {
		setExample(index) {
			this.examples = utils.examples[index];
			if (index == "mirror") {
				this.genome = utils.createPerceptronGenome("mirror", 3, 6, 6, 3);
				this.network = new Network({ learningRate: 0.01 }, this.genome);
				this.network.activate(this.examples[0].input);
        this.genome = this.network.getGenome();
        this.frame++;
			} else {
        this.genome = utils.createPerceptronGenome(index, 2, 5, 1);
				this.network = new Network({ learningRate: 0.01 }, this.genome);
				this.network.activate(this.examples[0].input);
				this.genome = this.network.getGenome();
        this.frame++;
			}
		},
		goes() {
			const getExample = () => {
				const example = this.examples[this.exampleIterator++];
				if (this.exampleIterator == this.examples.length) {
          this.exampleIterator = 0;
          this.examples = _.shuffle(this.examples);
				}
				return example;
			};

			const example = getExample();
			this.network.train(example);
			this.genome = this.network.getGenome();
			this.results = [];
			this.results.push({
				input: example.input,
				ideal: example.output,
				actual: this.network.getOutput()
			});
			this.frame++;
		},
		goesAll() {
			let loss = 0;
			this.results = [];
			_.each(_.shuffle(this.examples), example => {
				this.network.train(example);
				const actual = this.network.getOutput();
				this.results.push({
					input: example.input,
					ideal: example.output,
					actual: actual
				});
				_.times(example.output.length - 1, index => {
					loss += Math.pow(actual[index] - example.output[index], 2);
				});
			});
			this.loss = loss;
			this.genome = this.network.getGenome();
			this.frame++;
		},
		goesX() {
			for (let i = 0; i < this.goestimes; i++) {
				this.results = [];
				_.each(_.shuffle(this.examples), example => {
					this.network.train(example);
					this.results.push({
						input: example.input,
						ideal: example.output,
						actual: this.network.getOutput()
					});
				});
			}
			this.genome = this.network.getGenome();
			this.frame++;
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
