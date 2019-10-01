<template>
	<div id="app">
		<div class="field">
			<div class="visualization" ref="vis"></div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as _ from "lodash";
import * as vis from "vis-network";

export default Vue.extend({
	name: "app",

	created() {
		this.graph();
	},
	methods: {
		denormalize(low, high, value) {
			return +low + value * (high - low);
		},
		async graph() {
			const data = await import("../data.json");
			const genome = data.genome;
			const neurons = [] as any;

			const nodesRaw = genome.neurons.map((neuron, i) => {
				let color;
				if (neuron.type == "input") color = "#1c7bbb";
				if (neuron.type == "hidden") color = "#bb4e1c";
				if (neuron.type == "output") color = "#1cbb3d";

				return {
					id: neuron.id,
					title: neuron.id,
					label: neuron.id,
					color
				};
			}) as any;
			const nodes = new vis.DataSet(nodesRaw) as any;

			const edgesRaw = genome.connections.map(connection => {
				return {
					from: connection.from,
					to: connection.to,
					color: "#fff",
          width: this.denormalize(0, 5, connection.weight),
          arrows: 'to'
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

			const element = this.$refs["vis"] as any;
			const network_visualization = new vis.Network(
				element,
				{ nodes, edges },
				options
			);
		}
	}
});
</script>

<style>
body {
	background: black;
}
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
}
</style>
