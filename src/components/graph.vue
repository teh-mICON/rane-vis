<template>
	<div ref="graph"></div>
</template>

<script lang="ts">
import Vue from "vue";
import * as vis from "vis-network";
import * as _ from "lodash";
import Converter from "hex2dec";

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
		this.graph(this.$refs["graph"], this.genome);
	},

	methods: {
		graph: async (element, genome) => {
			const nodesRaw = genome.nodes.map((neuron, i) => {
				let color;
				if (neuron.type == "input") color = "#dbdd60";
				if (neuron.type == "hidden") color = "#92b6ce";
				if (neuron.type == "output") color = "#fff";

				const dec = Math.floor(denormalize(0, 255, neuron.activation));
				const hex = Converter.decToHex("" + dec, { prefix: false });
				color = "#" + hex + hex + hex;

				return {
					id: "" + neuron.id,
					title: "" + neuron.id,
					label: "" + neuron.id,
					color
				};
			}) as any;
			const nodes = new vis.DataSet(nodesRaw) as any;

			const filteredConnections = _.filter(
				genome.connections,
				connection => connection.enabled
			);

			const max = _.maxBy(filteredConnections, connection =>
				Math.abs(connection.weight)
			).weight;
			const min = _.minBy(filteredConnections, connection =>
				Math.abs(connection.weight)
			).weight;
			const edgesRaw = filteredConnections.map(connection => {
				const normalized = normalize(min, max, connection.weight);
				const width = denormalize(1, 10, normalized);
				return {
					from: connection.from,
					to: connection.to,
					width,
					arrows: "to",
					color: connection.weight > 0 ? "green" : "red"
				};
			}) as any;
			const edges = new vis.DataSet(
				_.remove(edgesRaw, edge => edge !== null)
			) as any;

			const options = {
				autoResize: true,
				height: "500px",
				width: "100%",
				edges: {
					smooth: {
						type: "cubicBezier",
						forceDirection: "vertical"
					}
				},
				layout: {
					hierarchical: {
						direction: "UD",
						sortMethod: "directed"
					}
				},
				physics: false
			} as any;

			new vis.Network(element, { nodes, edges }, options);
		}
	}
});
</script>

<style>
</style>
