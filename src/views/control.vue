<template>
	<div :key="frame">
		<Graph :network="graphNetwork" v-if="graphNetwork" />
		<div id="content">
			<div class="d-flex flex-row flexathon">
				<div class="controls">
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">X</span>
						</div>
						<input type="text" class="form-control" v-model="goestimes" @change="updateGoestimes" />
					</div>
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">cutoff</span>
						</div>
						<input type="text" class="form-control" v-model="cutoff" @change="updateCutoff" />
					</div>
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">update</span>
						</div>
						<input
							type="text"
							class="form-control"
							v-model="updateInterval"
							@change="updateUpdateInterval"
						/>
					</div>
				</div>
				<div class="controls">
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">learning</span>
						</div>
						<input type="text" class="form-control" v-model="learningRate" @change="updateLearningRate" />
					</div>
					<div class="input-group input-group-sm">
						<div class="input-group-prepend">
							<span class="input-group-text">momentum</span>
						</div>
						<input type="text" class="form-control" v-model="momentum" @change="updateMomentum" />
					</div>
				</div>
			</div>
			<div class="d-flex flex-row flexathon">
				<div class="btn-group" role="group" aria-label="Basic example">
					<button type="button" :class="btnClass('mirror')" @click="setExamples('mirror'); save();">mirror</button>
					<button type="button" :class="btnClass('X2')" @click="setExamples('X2'); save();">X2</button>
					<button type="button" :class="btnClass('AND')" @click="setExamples('AND'); save();">AND</button>
					<button type="button" :class="btnClass('OR')" @click="setExamples('OR'); save();">OR</button>
					<button type="button" :class="btnClass('XOR')" @click="setExamples('XOR'); save();">XOR</button>
					<button type="button" :class="btnClass('NAND')" @click="setExamples('NAND'); save();">NAND</button>
					<button type="button" :class="btnClass('NOR')" @click="setExamples('NOR'); save();">NOR</button>
					<button type="button" :class="btnClass('XNOR')" @click="setExamples('XNOR'); save();">XNOR</button>
				</div>
				<div class="input-group special">
					<div class="input-group-prepend">
						<button @click="save(); goesX()" class="btn btn-danger" type="button">GOES</button>
					</div>
					<button type="button" class="btn btn-primary" @click="stop">STOP</button>
					<button type="button" class="btn btn-outline-success" @click="save">save</button>
					<button type="button" class="btn btn-outline-info" @click="load">load</button>
				</div>
			</div>
			<div class="d-flex flex-row flexathon">
				<table id="result">
					<tr v-for="(result, index) in results" :key="index">
						<td class="input">{{result.input.join(',')}}</td>
						<td class="ideal">{{result.ideal.join(',')}}</td>
						<td class="actual">{{result.actual.join(' ')}}</td>
					</tr>
				</table>
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
			<div class="btn-group" role="group"></div>
			<Errors :errors="errors" v-if="errors" />
			<Genome :genome="genome" v-if="genome" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "../components/graph.vue";
import GenomeComponent from "../components/genome.vue";
import Errors from "../components/errors.vue";

import utils from "../utils";
import Squash from "../../../rane/src/Squash";

import _ from "lodash";

import Network from "../../../rane/src/Network";
import Genome from "../../../rane/src/Genome";

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
		Genome: GenomeComponent,
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
			updateInterval:
				localStorage.getItem("updateInterval") === null
					? 1000
					: localStorage.getItem("updateInterval"),
			learningRate:
				localStorage.getItem("learningRate") === null
					? 0.001
					: localStorage.getItem("learningRate"),
			momentum:
				localStorage.getItem("momentum") === null
					? 0.5
					: localStorage.getItem("momentum"),
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
    this.load();
    this.updateDisplay(0);
	},
	methods: {
		pause() {
			window.clearTimeout(this.timeout);
		},
		resume() {
			window.setTimeout(this.runFunc, 1);
		},
		stop() {
			window.clearTimeout(this.timeout);
			this.errors = [];
		},
		setExamples(index) {
			localStorage.setItem("activeExamples", index);

			this.normalize = false;
			if (index == "X2") {
				this.normalize = true;
			}
			this.errors = [];

			const config = {
				learningRate: this.learningRate,
				momentum: this.momentum
      };
			this.examples = utils.examples[index];
			if (index == "mirror") {
				this.genome = utils.createPerceptronGenome("relu", 3, 4, 5, 4, 3);
				this.network = new Network(this.genome, config);
			} else if (index == "X2") {
				this.genome = utils.createPerceptronGenome("relu", 1, 6, 6, 6, 1);
				this.network = new Network(this.genome, config);
			} else {
				this.genome = utils.createPerceptronGenome(
					"relu",
          2,
          4,5,4,
					1
				);
        this.network = new Network(this.genome, config);
      }
      this.updateDisplay(0)
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
						: _.map(actual, output => utils.toDecimaNum(output, 10))
				});
			});

			// finally set all display properties
			this.MSE = MSE * 0.5;
			this.graphNetwork = this.network;
			this.genome = this.network.getGenome();
			this.results = results;
      this.errors.push(this.MSE);
      if(this.errors.length > 100)
        this.errors.splice(0, 1)
			this.frame++;
			this.epoch = epoch;
      this.elapsedTime = (new Date().getTime() - this.startTime.getTime()) / 1000;
		},

		goesX() {
			let i = 0;
      this.startTime = new Date();

			// create initial state to display
			// main goes loop
			const goes = () => {
				for (let j = 0; j < this.updateInterval; j++) {
					// train the network for a random example
					const example = _.sample(this.examples);
					this.network.train(example);
				}
				i += parseInt(this.updateInterval as string);

				this.updateDisplay(i);

				if (this.MSE > this.cutoff && i < this.goestimes) {
					this.timeout = window.setTimeout(goes, 1);
				}
			};
			this.timeout = window.setTimeout(goes, 0);
			this.runFunc = goes;
		},

		btnClass(examples) {
			if (examples == localStorage.getItem("activeExamples"))
				return "btn btn-info";
			return "btn btn-secondary";
		},
		updateGoestimes() {
			window.localStorage.setItem("goestimes", this.goestimes as string);
			location.reload();
		},
		updateCutoff() {
			window.localStorage.setItem("cutoff", this.cutoff as string);
			location.reload();
		},
		updateUpdateInterval() {
			window.localStorage.setItem("updateInterval", this
				.updateInterval as string);
			location.reload();
		},
		updateLearningRate() {
			window.localStorage.setItem("learningRate", this.learningRate as string);
			location.reload();
		},
		updateMomentum() {
			window.localStorage.setItem("momentum", this.momentum as string);
			location.reload();
    },
    save() {
      console.log('SAVING')
			window.localStorage.setItem("genome", JSON.stringify(this.network.getGenome()));
    },
    load() {
      console.log('LOADING')
      const loaded = JSON.parse(window.localStorage.getItem('genome'));
      const genome = new Genome();
      genome.nodes = loaded.nodes;
      genome.connections = loaded.connections;
      this.network = new Network(genome);
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
.flexathon > * {
	margin-right: 20px;
  flex: 1;
}
.flexathon {
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
	width: 100px;
	background-color: black;
	color: white;
	border-right: 1px solid white;
}
#current td {
	padding-left: 15px;
}
html .lower {
  text-transform: lowercase;
}
.btn-group.special {
  display: flex;
}

.special .btn {
  flex: 1
}</style>
