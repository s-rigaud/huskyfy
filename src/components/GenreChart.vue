<template>
  <apexchart
    type="donut"
    width="380"
    :options="chartOptions"
    :series="series"
    @click="clickHandler"
    @legnedClick="clickHandler"
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
          position: "right",
          offsetY: 0,
          height: 230,
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
      var el = event.target;
      var seriesIndex = parseInt(el.getAttribute("j"));
      this.$emit("selectedGenre", this.genres[seriesIndex][0]);
      console.log("selected genre ", event.target);
    },
  },
};
</script>
