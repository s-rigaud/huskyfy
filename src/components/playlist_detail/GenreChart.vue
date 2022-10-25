<template>
  <div id="chart-container" ref="container">
    <h3>Top {{genres.length}} Genres</h3>
    <apexchart type="donut" :width="width" :options="chartOptions" :series="series"></apexchart>
  </div>
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
  mounted () {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const cr = entry.contentRect
        this.width = (cr.width > 500) ? 500 : cr.width
      })
    })

    observer.observe((this.$refs.container as HTMLDivElement))
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
      // random default value as observer overwrite this
      width: window.innerWidth - 10,

      // APEXCHART STYLING
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
<style scoped>
#chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
