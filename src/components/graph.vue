<template>
	<div>
		<div ref="graph2d" id="graph2d"></div>
		<div ref="graph3d" id="graph3d" v-if="goes3d"></div>
		<pre v-html="clickedNode" class="json_small"></pre>
		<pre v-html="clickedEdge" class="json_small"></pre>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import ForceGraph3D from "3d-force-graph";
import * as vis from "vis-network";
import * as _ from "lodash";
import beautify from "json-beautify";
import * as format from "json-format-highlight";
import Converter from "hex2dec";
import Network from "../../../rane/src/Network";
import Node from "../../../rane/src/Node";
import { NODE_TYPE } from "../../../rane/src/Node";

import utils from "../utils";

const NETVIS_COLORS = {
  input: '#4b8c48',
  hidden: '#48688c',
  action: '#b80f0f'
};

function normalize(low, high, value) {
	return (value - low) / (high - low);
}
function denormalize(low, high, value) {
	return +low + value * (high - low);
}

export default Vue.extend({
	name: "vis",

	props: ["network"],
	data() {
		return { clickedEdge: null, clickedNode: null, goes3d: false };
	},

	mounted() {
		this.graph(this.$refs["graph2d"], this.network, this);
    if(this.goes3d)
      this.graph3d(this.$refs["graph3d"], this.network, this);
	},

	methods: {
		graph: async (element, network: Network, vue) => {
			const nodesRaw = _.map(network.getNodes(), (node: Node) => {
        let border;
				if (node.getType() == NODE_TYPE.input) border = "#dbdd60";
				if (node.getType() == NODE_TYPE.hidden) border = "#92b6ce";
				if (node.getType() == NODE_TYPE.output) border = "#ffffff";

				const dec = Math.floor(denormalize(0, 255, node.getOutput()));
				const hex = Converter.decToHex("" + dec, { prefix: false });
				const color = "#" + hex + hex + hex;
				const connectionMapper = connection => {
					return {
						from: connection.from.id,
						to: connection.to.id,
						weight: connection.weight,
						delta: connection.delta
					};
				};
				const connections = {
					forward: _.map(node.getConnectionsForward(), connectionMapper),
					backward: _.map(node.getConnectionsBackward(), connectionMapper)
				};
				return {
					id: "" + node.getId(),
					title: "" + node.getId(),
					label: "" + node.getId(),
          color: {
            background: color, border, highlight: 'red'
          },
					custom: {
						id: node.getId(),
						netInput: node.getNetInput(),
						output: node.getOutput(),
						connections
					}
				};
			}) as any;
			const nodes = new vis.DataSet(nodesRaw) as any;

			const max = _.maxBy(network.getConnections(), connection => connection.weight)
				.weight;
			const min = _.minBy(network.getConnections(), connection => connection.weight)
				.weight;
			const edgesRaw = network.getConnections().map(connection => {
				const normalized = normalize(min, max, connection.weight);
				const width = denormalize(1, 10, normalized);
				return {
					from: connection.from.getId(),
					to: connection.to.getId(),
					width,
					arrows: "to",
					color: connection.weight > 0 ? "green" : "red",
					custom: { connection }
				};
			}) as any;
			const edges = new vis.DataSet(
				_.remove(edgesRaw, edge => edge !== null)
			) as any;

			const options = {
				autoResize: true,
				height: "250px",
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

			const visNetwork = new vis.Network(element, { nodes, edges }, options);

			visNetwork.on("click", properties => {
				const nodeIds = properties.nodes;
				const node = nodes.get(nodeIds)[0];

				const edgeIds = properties.edges;
				const edge = edges.get(edgeIds)[0];

				if (node && node.custom ) {
					vue.clickedNode = format(
						beautify(node.custom, null as any, 2, 100)
					);
				} else {
					vue.clickedNode = "";
				}
				if (edge && edge.custom && edge.custom.connection) {
					vue.clickedEdge = format(
						beautify(edge.custom.connection, null as any, 2, 100)
					);
				} else {
					vue.clickedEdge = "";
				}
			});
    },

		async graph3d(element, network: Network, vue) {
			const max = _.maxBy(network.getConnections(), connection => connection.weight)
				.weight;
			const min = _.minBy(network.getConnections(), connection => connection.weight)
				.weight;

			const gData = {
				nodes: _.map(network.getNodes(), node => ({
					id: node.getId(),
					type: node.getType()
				})),
				links: _.map(network.getConnections(), connection => {
					const normalized = normalize(min, max, connection.weight);
					const width = denormalize(1, 3, normalized);
					return {
						source: connection.from.id,
            target: connection.to.id,
            weight: connection.weight,
						width
					};
				})
			};
			const Graph = ForceGraph3D()(element)
				.graphData(gData)
				.linkDirectionalArrowLength(3.5)
				.linkDirectionalArrowRelPos(1)
        .linkCurvature(0.25)
        .linkColor(link => {
          return link.weight > 0 ? 'green' : 'red'
        })
				.nodeColor(node => {
					if (node.type == "input") return NETVIS_COLORS.input;
					if (node.type == "hidden") return NETVIS_COLORS.hidden;
					if (node.type == "action") return NETVIS_COLORS.action;
					return "#ff0000";
				})
				.linkWidth(node => node.width)
        .height(500)
        .backgroundColor('black') ;
		}    
	}
});
</script>

<style>
.json_small {
	font-size: 14px;
	background-color: #111;
}
#graph2d {
  background-color: black;
}
#graph3d {
	height: 500px;
}

</style>
