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
    const genome = {connections: [], biases: {} }

    _.each(this.genome.connections, connection => {
      genome.connections.push({ id: connection.innovation, weight: utils.toDecimaNum(connection.weight, 8), delta: utils.toDecimaNum(connection.delta, 8) })
    })

    _.each(this.genome.nodes, node => {
      genome.biases[node.id] = utils.toDecimaNum(node.bias, 8);
    })

		this.json = format(beautify(genome, null as any, 2, 100));
	}
});
</script>

<style>
</style>
