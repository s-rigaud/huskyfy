<template>
  <apexchart
    type="radialBar"
    height="350"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script>
export default {
  name: "IndieChart",
  props: {
    indiePercentage: Number,
    image: String,
  },
  data() {
    // All data needed to customize graph UI and data
    return {
      series: [this.indiePercentage],
      chartOptions: {
        chart: {
          height: 350,
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 15,
              size: "30%",
              image: this.image,
              imageWidth: 64,
              imageHeight: 64,
              imageClipped: false,
            },
            dataLabels: {
              name: {
                show: false,
                color: "#fff",
              },
              value: {
                show: true,
                color: "#333",
                offsetY: 70,
                fontSize: "22px",
              },
            },
          },
        },
        fill: {
          type: "image",
          image: {
            src: [require("@/assets/palmtree.webp")],
          },
        },
        labels: ["Indie %"],
      },
    };
  },
};
</script>
