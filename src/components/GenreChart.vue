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
    // Emit genre on click
    clickHandler(event) {
      if (event instanceof TouchEvent) return;

      const el = event.target;
      const isLegendClick =
        el.nodeName == "SPAN" &&
        Array.from(el.classList).includes("apexcharts-legend-text");
      const isChartClick =
        el.nodeName == "path" &&
        Array.from(el.classList).includes("apexcharts-pie-area");

      if (!isLegendClick && !isChartClick) return;

      let genreLabel = "";
      if (isLegendClick) {
        genreLabel = event.target.textContent;
      } else {
        const seriesIndex = parseInt(el.getAttribute("j"));
        genreLabel = this.genres[seriesIndex][0];
      }
      this.$emit("selectedGenre", genreLabel.toLowerCase());
    },
  },
  data() {
    // All data needed to customize graph UI and data
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
            },
          },
        ],
        legend: {
          position: "bottom",
          onItemHover: {
            highlightDataSeries: true,
          },
        },
      },
    };
  },
};
</script>
<style scoped>
.apexcharts-legend-text:hover {
  font-weight: bold;
}
</style>