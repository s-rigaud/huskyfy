<template>
  <h3>Indie score</h3>

  <apexchart type="radialBar" height="350" :options="chartOptions" :series="series"></apexchart>

  <h5>{{ indiePercentage }}% {{ indieText }}</h5>
</template>

<script lang="ts">
import { usePlaylistsStore } from '@/stores/playlists'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndieChart',
  props: {
    indiePercentage: {
      type: Number,
      default: 0,
    }
  },
  setup() {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  computed: {
    indieText(): string {
      if (this.indiePercentage > 35) return this.$t('playlist.indie-text.high')
      return this.$t('playlist.indie-text.low')
    }
  },
  methods: {
    getImage(): string {
      let image = ''
      if (this.indiePercentage < 25) image = 'cold'
      else if (this.indiePercentage < 50) image = 'sunglasses'
      else if (this.indiePercentage < 75) image = 'hot'
      else image = 'fire'
      return require(`@/assets/${image}.png`)
    }
  },
  watch: {
    indiePercentage(newValue: number) {
      this.series = [newValue]
      this.chartOptions.plotOptions.radialBar.hollow.image = this.getImage()
    }
  },
  data() {
    // All data needed to customize graph UI and data
    return {
      series: [this.indiePercentage],
      chartOptions: {
        chart: {
          height: 350,
          type: 'radialBar'
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 15,
              size: '30%',
              image: this.getImage(),
              imageWidth: 64,
              imageHeight: 64,
              imageClipped: false
            },
            dataLabels: {
              name: {
                show: false,
                color: '#fff'
              },
              value: {
                show: true,
                color: '#333',
                offsetY: 70,
                fontSize: '22px'
              }
            }
          }
        },
        fill: {
          type: 'image',
          image: {
            src: [require('@/assets/palmtree.webp')]
          }
        },
        labels: ['Indie %']
      }
    }
  }
})
</script>
