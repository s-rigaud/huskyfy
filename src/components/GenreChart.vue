<template>
  <apexchart
    type="donut"
    width="380"
    :options="chartOptions"
    :series="series"
    @click="clickHandler"
  ></apexchart>
</template>

<script>
export default {
  name: "GenreChart",
  props: {
    genres: Array,
  },
  data() {
    return {
      series: this.genres.map((g) => g[1]),
      chartOptions: {
        chart: {
          width: 380,
          type: "donut",
        },
        labels: this.genres.map((g) => this.capitalize(g[0])),
        dataLabels: {
          enabled: false,
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                show: false,
              },
            },
          },
        ],
        legend: {
          position: "bottom",
        },
      },
    };
  },
  methods: {
    appendData() {
      var arr = this.series.slice();
      arr.push(Math.floor(Math.random() * (100 - 1 + 1)) + 1);
      this.series = arr;
    },

    removeData() {
      if (this.series.length === 1) return;
      var arr = this.series.slice();
      arr.pop();
      this.series = arr;
    },
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    clickHandler(event) {
      if (event instanceof TouchEvent) return;

      const el = event.target;
      const isLengendClick =
        el.nodeName == "SPAN" &&
        Array.from(el.classList).includes("apexcharts-legend-text");
      const isChartClick =
        el.nodeName == "path" &&
        Array.from(el.classList).includes("apexcharts-pie-area");

      if (!isLengendClick && !isChartClick) return;

      let genreLabel = "";
      if (isLengendClick) {
        genreLabel = event.target.textContent;
      }
      // Click on graph
      else {
        const seriesIndex = parseInt(el.getAttribute("j"));
        genreLabel = this.genres[seriesIndex][0];
      }
      this.$emit("selectedGenre", genreLabel.toLowerCase());
    },
  },
};
</script>
<style scoped>
.apexcharts-legend-text:hover {
  font-weight: bold;
}
</style>