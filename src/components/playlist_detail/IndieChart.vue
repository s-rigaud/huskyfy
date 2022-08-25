<template>
  <h3>Indie score</h3>

  <apexchart type="radialBar" height="350" :options="chartOptions" :series="series"></apexchart>
</template>

<script lang="ts">
import { usePlaylistsStore } from '@/stores/playlists'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndieChart',
  props: {
    playlistId: String
  },
  setup () {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  methods: {
    getIndiePercentage (): number {
      return this.playlistsStore.getIndiePercentage(this.playlistId!)
    },
    getImage (): string {
      let image = ''
      const indiePercentage = this.getIndiePercentage()
      if (indiePercentage < 25) image = 'cold'
      else if (indiePercentage < 50) image = 'sunglasses'
      else if (indiePercentage < 75) image = 'hot'
      else image = 'fire'
      return require(`@/assets/${image}.png`)
    }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      series: [this.getIndiePercentage()],
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
