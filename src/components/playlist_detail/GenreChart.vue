<template>
  <apexchart
    type="donut"
    width="380"
    :options="chartOptions"
    :series="series"
  ></apexchart>
</template>

<script>
export default {
  name: 'GenreChart',
  props: {
    genres: Array
  },
  methods: {
    appendData () {
      const arr = this.series.slice()
      arr.push(Math.floor(Math.random() * (100 - 1 + 1)) + 1)
      this.series = arr
    },
    removeData () {
      if (this.series.length === 1) return
      const arr = this.series.slice()
      arr.pop()
      this.series = arr
    }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      lastGenreSelected: false,
      lastClickedWasSelection: false,
      series: this.genres.map((genre) => genre.value),
      chartOptions: {
        chart: {
          width: 380,
          type: 'donut'
        },
        labels: this.genres.map((genre) => genre.cap_name),
        dataLabels: {
          enabled: false
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              }
            }
          }
        ],
        legend: {
          position: 'bottom',
          onItemHover: {
            highlightDataSeries: true
          }
        }
      }
    }
  }
}
</script>
<style scoped>
.apexcharts-legend-text:hover {
  font-weight: bold;
}
</style>
