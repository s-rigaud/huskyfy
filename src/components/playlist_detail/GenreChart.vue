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

<script setup lang="ts">
import { ApexOptions } from 'apexcharts'
import { PropType, onMounted, ref, watch } from 'vue'

import { Genre } from '@/genre'
import { usePlaylistsStore } from '@/stores/playlists'

const props = defineProps({
  genres: {
    type: Array as PropType<Genre[]>,
    required: true
  }
})

const playlistsStore = usePlaylistsStore()
const START_COLORS = props.genres.map(genre => playlistsStore.genreColorMapping[genre.name])

// random default value as observer overwrite this
const width = ref(380)

const series = ref(props.genres.map((genre) => genre.count))
const container = ref<HTMLElement | null>(null)

const chartOptions = ref<ApexOptions>({
  chart: {
    width: 380,
    type: 'donut'
  },
  labels: props.genres.map((genre) => genre.cap_name),

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
  colors: (START_COLORS as unknown as string[]),
  plotOptions: {
    pie: {
      expandOnClick: false
    }
  }
})

/**
 * Force the graph update when provided props is updated
 */
watch(() => props.genres, (newGenres: Genre[]) => {
  initializeGraphData(newGenres)
})

onMounted(() => {
  // Update graphic size according the screen width
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const cr = entry.contentRect
      width.value = (cr.width > 500) ? 500 : cr.width
    })
  })

  observer.observe(container.value as HTMLElement)
})

const getColorsForGenres = (genres: Genre[]): string[] => {
  const colorMapping = playlistsStore.genreColorMapping
  return genres.map(genre => colorMapping[genre.name])
}
const initializeGraphData = (newGenres: Genre[]) => {
  series.value = newGenres.map((genre) => genre.count)
  chartOptions.value = {
    ...chartOptions,
    labels: newGenres.map(genre => genre.cap_name),
    colors: getColorsForGenres(newGenres),
    ...{
      chart: {
        width: width.value
      }
    }
  }
}
</script>

<style scoped>
#chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
