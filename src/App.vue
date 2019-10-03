<template>
	<Graph :genome="genome" v-if="genome"/>
</template>

<script lang="ts">
import Vue from "vue";
import Graph from "./components/graph.vue";
import utils from "./utils";

export default Vue.extend({
	name: "app",

	components: {
		Graph
	},

	data() {
		return { genome: null as any };
	},
	created() {
		this.vis();
	},
	methods: {
		async vis() {
			//const data = await import("../data.json");
			//this.genome = data.genome;
		}
	}
});
</script>

<style>
body {
  background: #111;
  color: #eee;
}
</style>
