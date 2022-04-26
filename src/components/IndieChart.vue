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
  },
  data() {
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
              image:
                "https://images.emojiterra.com/google/android-10/512px/1f60e.png",
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
            src: [
              "https://s1.qwant.com/thumbr/0x380/2/9/0224dc49701b7ab7677a9ac8a9450c7f4f1312288135614e5163da17800682/palm-tree-24.jpg?u=https%3A%2F%2Fjooinn.com%2Fimages%2Fpalm-tree-24.jpg&q=0&b=1&p=0&a=0",
            ],
          },
        },
        stroke: {
          lineCap: "round",
        },
        labels: ["Indie %"],
      },
    };
  },
};
</script>
