<template>
	<div id="app">
		<div class="field">
			<div class="visualization" ref="vis"></div>
      <pre v-html="hbgenome"/>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as vis from "vis-network";

import jb from 'json-beautify'
import * as jfh from 'json-format-highlight';
import * as _ from 'lodash'

export default Vue.extend({
	name: "app",

	created() {
		this.graph();
  },
  data() {
    return { genome: null as any }
  },
  computed: {
    hbgenome() {
      const self = this as any;
      if(self.genome === null) {
        return '';
      }
      console.log(self.genome)
      console.log(jb)
      return jfh(jb(self.genome, null as any, 2, 100));
      return '';
    }
  },
	methods: {
		async graph() {
			const data = await import("../data.json");
			const genome = this.genome = data.genome;

			const nodesRaw = genome.nodes.map((neuron, i) => {
				let color;
				if (neuron.type == "input") color = "#dbdd60";
				if (neuron.type == "hidden") color = "#92b6ce";
				if (neuron.type == "output") color = "#fff";

				return {
					id: ""+neuron.id,
					title: ""+neuron.id,
					label: ""+neuron.id,
					color
				};
			}) as any;
      const nodes = new vis.DataSet(nodesRaw) as any;
      
      const filteredConnections = _.filter(genome.connections, (connection) => connection.enabled)
			const edgesRaw = filteredConnections.map(connection => {
				return {
					from: connection.from,
          to: connection.to,
          //TODO: squash/normalize
          width: connection.weight,
          arrows: 'to',
          color: connection.weight > 0 ? 'green' : 'red'
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
  color: #fff;
}
#asd {
  color: #92b6ce;
}
</style>
