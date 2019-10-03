<template>
	<div>
		<div ref="graph"></div>
		<pre v-html="json" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as vis from "vis-network";

import beautify from "json-beautify";
import * as format from "json-format-highlight";
import * as _ from "lodash";

import utils from "../utils";

  function normalize(low, high, value) {
    return (value - low) / (high - low)
  }
  function denormalize(low, high, value) {
    return +low + (value * (high - low))
  }


export default Vue.extend({
	name: "vis",

	props: ["genome"],
	data() {
		return { json: "" };
	},

	mounted() {
		this.json = format(beautify(this.genome, null as any, 2, 100));
		this.graph(this.$refs["graph"], this.genome);
	},

	methods: {
		graph: async (element, genome) => {
			const nodesRaw = genome.nodes.map((neuron, i) => {
				let color;
				if (neuron.type == "input") color = "#dbdd60";
				if (neuron.type == "hidden") color = "#92b6ce";
				if (neuron.type == "output") color = "#fff";

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

      const max = _.maxBy(filteredConnections, (connection) => connection.weight).weight;
      const min = _.minBy(filteredConnections, (connection) => connection.weight).weight;
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
			const edges = new vis.DataSet(edgesRaw) as any;

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
						direction: "LR",
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
