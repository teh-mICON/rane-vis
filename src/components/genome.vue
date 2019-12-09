<template>
	<pre v-html="json" />
</template>

<script lang="ts">
import Vue from "vue";

import beautify from "json-beautify";
import * as format from "json-format-highlight";
import * as _ from "lodash";

import utils from "../utils";

function normalize(low, high, value) {
	return (value - low) / (high - low);
}
function denormalize(low, high, value) {
	return +low + value * (high - low);
}

export default Vue.extend({
	name: "vis",

	props: ["genome"],
	data() {
		return { json: "" };
	},

	mounted() {
		const genome = { weights: [], nodes: {} };

		_.each(this.genome.connections, connection => {
			genome.weights.push({
				id: connection.innovation,
				weight: Math.round(connection.weight * 100000000) / 100000000,
				from: connection.from,
				to: connection.to
			});
		});

		_.each(this.genome.nodes, node => {
			genome.nodes[node.id] = {bias: Math.round(node.bias * 100000000) / 100000000, activation: node.activation };
		});

		this.json = format(beautify(genome, null as any, 2, 100));
	}
});
</script>

<style>
</style>
