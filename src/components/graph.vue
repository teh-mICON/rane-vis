<template>
	<div>
		<div ref="graph"></div>
		<pre v-html="clickedNode" class="json_small"></pre>
		<pre v-html="clickedEdge" class="json_small"></pre>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as vis from "vis-network";
import * as _ from "lodash";
import beautify from "json-beautify";
import * as format from "json-format-highlight";
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
		return { clickedEdge: null, clickedNode: null };
	},

	mounted() {
		this.graph(this.$refs["graph"], this.genome, this);
	},

	methods: {
		graph: async (element, genome, vue) => {
			const nodesRaw = genome.nodes.map((node, i) => {
				let color;
				if (node.type == "input") color = "#dbdd60";
				if (node.type == "hidden") color = "#92b6ce";
				if (node.type == "output") color = "#fff";

				const dec = Math.floor(denormalize(0, 255, node.activation));
				const hex = Converter.decToHex("" + dec, { prefix: false });
				color = "#" + hex + hex + hex;

				return {
					id: "" + node.id,
					title: "" + node.id,
					label: "" + node.id,
					color,
					custom: { node }
				};
			}) as any;
			const nodes = new vis.DataSet(nodesRaw) as any;

			const filteredConnections = _.filter(genome.connections, connection => connection.enabled);

			const max = _.maxBy(filteredConnections, connection => connection.weight).weight;
      const min = _.minBy(filteredConnections, connection => connection.weight).weight;
			const edgesRaw = filteredConnections.map(connection => {
				const normalized = normalize(min, max, connection.weight);
				const width = denormalize(1, 10, normalized);
				return {
					from: connection.from,
					to: connection.to,
					width,
					arrows: "to",
					color: connection.weight > 0 ? "green" : "red",
					custom: { connection }
				};
			}) as any;
			const edges = new vis.DataSet(_.remove(edgesRaw, edge => edge !== null)) as any;

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

			const network = new vis.Network(element, { nodes, edges }, options);

			network.on("click", properties => {
				const nodeIds = properties.nodes;
				const node = nodes.get(nodeIds)[0];

				const edgeIds = properties.edges;
				const edge = edges.get(edgeIds)[0];

        console.log(nodes.get(nodeIds));
        if(node && node.custom && node.custom.node) {
          vue.clickedNode = format(beautify(node.custom.node, null as any, 2, 100));
        } else {
          vue.clickedNode = '';
        }
        if(edge && edge.custom && edge.custom.connection) {
          vue.clickedEdge = format(beautify(edge.custom.connection, null as any, 2, 100));
        } else {
          vue.clickedEdge = '';
        }
			});
		}
	}
});
</script>

<style>
.json_small {
  font-size: 10px;
  background-color: #111;
}
</style>
