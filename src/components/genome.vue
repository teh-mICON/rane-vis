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
		this.json = format(beautify(this.genome, null as any, 2, 100));
	}
});
</script>

<style>
</style>
