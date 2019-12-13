<template>
	<div :key="frame">
		<Graph :network="graphNetwork" v-if="graphNetwork" />
		<div id="content">
			<div class="d-flex flex-row" id="flexathon">
				<table id="result">
					<tr v-for="(result, index) in results" :key="index">
						<td class="input">{{result.input.join(',')}}</td>
						<td class="ideal">{{result.ideal.join(',')}}</td>
						<td class="actual">{{result.actual.join(' ')}}</td>
					</tr>
				</table>
				<div class="btn-group" role="group" aria-label="Basic example">
					<button type="button" :class="btnClass('mirror')" @click="setExamples('mirror')">mirror</button>
					<button type="button" :class="btnClass('X2')" @click="setExamples('X2')">X2</button>
					<button type="button" :class="btnClass('AND')" @click="setExamples('AND')">AND</button>
					<button type="button" :class="btnClass('OR')" @click="setExamples('OR')">OR</button>
					<button type="button" :class="btnClass('XOR')" @click="setExamples('XOR')">XOR</button>
					<button type="button" :class="btnClass('NAND')" @click="setExamples('NAND')">NAND</button>
					<button type="button" :class="btnClass('NOR')" @click="setExamples('NOR')">NOR</button>
					<button type="button" :class="btnClass('XNOR')" @click="setExamples('XNOR')">XNOR</button>
				</div>
				<table id="current">
					<tr>
						<th>time</th>
						<td>{{elapsedTime}}s</td>
					</tr>
					<tr>
						<th>epoch</th>
						<td>{{epoch}}</td>
					</tr>
					<tr>
						<th>MSE</th>
						<td>{{MSE}}</td>
					</tr>
				</table>
			</div>
			<div class="d-flex flex-row">
				<div>
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">X</span>
						</div>
						<input
							type="text"
							class="form-control"
							v-model="goestimes"
						/>
					</div>
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">cutoff</span>
						</div>
						<input
							type="text"
							class="form-control"
							v-model="cutoff"
						/>
					</div>
				</div>
				<div class="input-group">
					<div class="input-group-prepend">
						<button @click="goesX" class="btn btn-primary" type="button">GOES</button>
					</div>
					<button type="button" class="btn btn-primary" @click="pause">PAUSE</button>
					<button type="button" class="btn btn-primary" @click="resume">RESUME</button>
				</div>
			</div>
			<div class="btn-group" role="group"></div>
			<Errors :errors="errors" v-if="errors" />
			<Genome :genome="genome" v-if="genome" />
		</div>
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
			activeExamples: "mirror",
			goestimes:
				localStorage.getItem("goestimes") === null
					? 1000000
					: localStorage.getItem("goestimes"),
			cutoff:
				localStorage.getItem("cutoff") === null
					? 0.001
					: localStorage.getItem("cutoff"),
			MSE: 0,
			errors: [],
			epoch: 0,
			runFunc: null,
			timeout: null,
			startTime: new Date(),
			elapsedTime: null
		};
	},
	async created() {
		document.title = "rane 0-3";
		let examples = localStorage.getItem("activeExamples");
		if (examples === null) {
			examples = "XOR";
		}
		this.setExamples(examples);
		this.updateDisplay(0);
		//this.goesX();
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
		setExamples(index) {
			localStorage.setItem("activeExamples", index);

			this.normalize = false;
			if (index == "X2") {
				this.normalize = true;
			}
			this.resetErrors();
			this.examples = utils.examples[index];
			if (index == "mirror") {
				this.genome = utils.createPerceptronGenome("relu", 3, 6, 6, 3);
				this.network = new Network(this.genome);
			} else if (index == "X2") {
				this.genome = utils.createPerceptronGenome("relu", 1, 6, 6, 6, 1);
				this.network = new Network(this.genome);
			} else {
				this.genome = utils.createPerceptronGenome("relu", 2, 5, 7, 5, 1);
				this.network = new Network(this.genome);
			}
		},

		updateDisplay(epoch) {
			const results = [];
			let MSE = 0;
			_.each(this.examples, example => {
				// activate network
				const actual = this.network.activate(example.input);

				// add every error to the MSE
				_.each(example.output, (ideal, index) => {
					MSE += Math.pow(actual[index] - ideal, 2);
				});

				// add result to display
				results.push({
					input: this.normalize
						? _.map(example.input, value => denormalize(1, 6, value))
						: example.input,
					ideal: this.normalize
						? _.map(example.output, value => denormalize(2, 12, value))
						: example.output,
					actual: this.normalize
						? _.map(actual, value => denormalize(2, 12, value))
						: _.map(actual, output => utils.toDecimaNum(output))
				});
      });

			// finally set all display properties
			this.MSE = MSE * 0.5;
			this.graphNetwork = this.network;
			this.genome = this.network.getGenome();
			this.results = results;
			this.errors.push(this.MSE);
			this.frame++;
			this.epoch = epoch;
			this.elapsedTime =
				(new Date().getTime() - this.startTime.getTime()) / 1000;
		},

		goesX() {
			let i = 0;
			this.startTime = new Date();

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

				if (i > 0 && this.MSE > this.cutoff && i < this.goestimes) {
					this.timeout = window.setTimeout(goes, 1);
				}
			};
			this.timeout = window.setTimeout(goes, 10);
			this.runFunc = goes;
		},

		btnClass(examples) {
			if (examples == localStorage.getItem("activeExamples"))
				return "btn btn-danger";
			return "btn btn-secondary";
		}
	},
	watch: {
		goestimes(value) {
			window.localStorage.setItem("goestimes", value);
		},
		cutoff(value) {
			window.localStorage.setItem("cutoff", value);
		}
	}
});
</script>

<style>
html body {
	background-color: #0c0c0c;
	color: #eee;
}
#content {
	padding: 20px;
}
input[type="text"] {
	background-color: black;
	color: #ddd;
	border: 0;
}
html pre {
	color: #eee;
}
#flexathon > * {
	padding: 0 20px;
}
#flexathon {
	margin-bottom: 10px;
}
#goestimes {
	padding-left: 10px;
}
#result {
	font-family: "Consolas";
}
#result td {
	border: 1px solid #333;
	padding: 5px;
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
#trend {
	margin-bottom: 20px;
}
html .btn {
  padding: 10px;
}
html .btn-secondary {
  background-color: black;
  color: white;
}
html .input-group-text {
  width: 75px;
  background-color: black;
  color: white;
  border-right: 1px solid white;
}
#current td {
  padding-left: 15px;
}

</style>
