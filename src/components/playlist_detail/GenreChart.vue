<template>
  <div
    id="chart-container"
    ref="container"
  >
    <h3>Top {{ genres.length }} Genres</h3>
    <apexchart
      :options="chartOptions"
      :series="series"
      :width="width"
      type="donut"
    />
  </div>
</template>

<script lang="ts">
import { ApexOptions } from 'apexcharts'
import { defineComponent, PropType, toRefs } from 'vue'

import { Genre } from '@/genre'
import { usePlaylistsStore } from '@/stores/playlists'

export default defineComponent({
  name: 'GenreChart',
  props: {
    genres: {
      type: Array as PropType<Genre[]>,
      required: true
    }
  },
  setup (props) {
    const playlistsStore = usePlaylistsStore()
    const { genres } = toRefs(props)
    const START_COLORS = genres.value.map(genre => playlistsStore.genreColorMapping[genre.name])
    return { playlistsStore, START_COLORS }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      // random default value as observer overwrite this
      width: 380,

      // APEXCHART STYLING
      series: this.genres.map((genre) => genre.count),

      chartOptions: {
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
            // Set label for pie portions as the genre count
            return opts.w.globals.initialSeries[opts.seriesIndex]
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
        colors: (this.START_COLORS as unknown as string[]),
        plotOptions: {
          pie: {
            expandOnClick: false
          }
        }
      } as ApexOptions
    }
  },
  watch: {
    /**
     * Force the graph update when provided props is updated
     */
    genres (newGenres: Genre[]) {
      this.series = newGenres.map((genre) => genre.count)
      this.chartOptions = {
        ...this.chartOptions,
        labels: newGenres.map(genre => genre.cap_name),
        colors: this.getColorsForGenres(newGenres),
        ...{
          chart: {
            width: this.width
          }
        }
      }
    }
  },
  mounted () {
    // Update graphic size according the screen width
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const cr = entry.contentRect
        this.width = (cr.width > 500) ? 500 : cr.width
      })
    })

    observer.observe(this.$refs.container as HTMLDivElement)
  },
  methods: {
    getColorsForGenres (genres: Genre[]): string[] {
      const colorMapping = this.playlistsStore.genreColorMapping
      return genres.map(genre => colorMapping[genre.name])
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
