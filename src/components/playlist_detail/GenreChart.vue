<template>
  <div
    id="chart-container"
    ref="container"
  >
    <h3>Top {{ genres.length }} Genres</h3>
    <apexchart
      type="donut"
      :width="width"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { ApexOptions } from 'apexcharts'
import { defineComponent, PropType } from 'vue'

import { Genre } from '@/model'

export default defineComponent({
  name: 'GenreChart',
  props: {
    genres: {
      type: Array as PropType<Genre[]>,
      required: true
    }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      // random default value as observer overwrite this
      width: window.innerWidth - 10,

      // APEXCHART STYLING
      series: this.genres.map((genre) => genre.count),

      chartOptions: ({
        chart: {
          width: 380,
          type: 'donut'
        },
        labels: this.genres.map((genre) => genre.cap_name),

        // Names on the graph parts
        dataLabels: {
          enabled: true,
          formatter (
            _: string | number | number[],
            opts: { seriesIndex: number, w: { globals: { initialSeries: Record<number, number> } } }
          ): string | number {
            const number = opts.w.globals.initialSeries[opts.seriesIndex]
            return number
          }
        },

        legend: {
          position: 'bottom',
          onItemHover: {
            highlightDataSeries: true
          },
          onItemClick: {
            toggleDataSeries: false
          },
          labels: {
            colors: ['#fff']
          },
          fontSize: '13px'
        },
        colors: [
          // German palette https://flatuicolors.com/palette/de
          '#fc5c65', '#eb3b5a',
          '#fd9644', '#fa8231',
          '#fed330', '#f7b731',
          '#26de81', '#20bf6b',
          '#2bcbba', '#0fb9b1',
          '#45aaf2', '#2d98da',
          '#4b7bec', '#3867d6',
          '#a55eea', '#8854d0',
          '#d1d8e0', '#a5b1c2',
          '#778ca3', '#4b6584'
        ],
        plotOptions: {
          pie: {
            expandOnClick: false
          }
        }
      } as ApexOptions)
    }
  },
  watch: {
    genres (newValue: Genre[]) {
      this.series = newValue.map((genre) => genre.count)
      this.chartOptions.labels = newValue.map((genre) => genre.cap_name)
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
