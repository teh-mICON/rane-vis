<template>
	<trend :data="chart" :gradient="gradient" auto-draw smooth/>
</template>

<script lang="ts">
import Vue from "vue";
import * as _ from "lodash";


export default Vue.extend({
	name: "errors",

	props: ["errors"],
	data() {
		return {
      chart: this.errors,
      gradient: ['#0FF', '#FF0']
		};
	},

	mounted() {
	}
});
</script>

<style>
</style>
