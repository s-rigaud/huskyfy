<template>
  <h3>Top {{genres.length}} Genres</h3>
  <apexchart type="donut" width="380" :options="chartOptions" :series="series"></apexchart>
</template>

<script lang="ts">
import { Genre } from '@/model'
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'GenreChart',
  props: {
    genres: {
      type: Array as PropType<Genre[]>,
      required: true
    }
  },
  watch: {
    genres (newValue: Genre[]) {
      this.series = newValue.map((genre) => genre.value)
      this.chartOptions.labels = newValue.map((genre) => genre.cap_name)
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
})
</script>
