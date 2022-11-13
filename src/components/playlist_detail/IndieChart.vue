<template>
  <div id="genre-chart-container">
    <apexchart type="radialBar" :options="chartOptions" :series="series"></apexchart>
    <p id="genre-chart-subtitle"> {{ $t("playlist.indie-score-text") }}</p>
  </div>
</template>

<style>
#genre-chart-container {
  display: flex !important;
  flex-direction: column;
  align-items: center;
}

#genre-chart-container .vue-apexcharts {
  min-height: 75px !important;
}

#genre-chart-container .apexcharts-canvas {
  height: 50px !important;
}

#genre-chart-subtitle {
  color: var(--text-color)
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import { ApexOptions } from 'apexcharts'

const LOWEST_VALUE_COLOR = '#f35800'
const HIGHEST_VALUE_COLOR = '#21f92e'

export default defineComponent({
  name: 'IndieChart',
  props: {
    indiePercentage: Number
  },
  watch: {
    indiePercentage (newValue: number) {
      this.series = [newValue]

      const averageColor = this.getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, newValue)
      this.chartOptions = {
        ...this.chartOptions,
        ...{
          colors: [averageColor],
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  color: this.getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, newValue)
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {
    getAverageColor (color1: string, color2: string, percentage: number): string {
      const rgbColor1 = (color1.replace('#', '').match(/.{1,2}/g) as RegExpMatchArray).map(hex => parseInt(hex, 16))
      const rgbColor2 = (color2.replace('#', '').match(/.{1,2}/g) as RegExpMatchArray).map(hex => parseInt(hex, 16))

      console.error(rgbColor1, rgbColor2)

      const realPercentage = percentage / 100
      console.error(realPercentage)

      const rgbAverageColor = [
        (rgbColor1[0] * (1 - realPercentage) + rgbColor2[0] * realPercentage),
        (rgbColor1[1] * (1 - realPercentage) + rgbColor2[1] * realPercentage),
        (rgbColor1[2] * (1 - realPercentage) + rgbColor2[2] * realPercentage)
      ]
      console.error(rgbAverageColor)
      console.error((~~(rgbAverageColor[0])).toString(16).padStart(2, '0'))
      console.error((~~(rgbAverageColor[1])).toString(16).padStart(2, '0'))
      console.error((~~(rgbAverageColor[2])).toString(16).padStart(2, '0'))

      const hexAverageColor = (
        '#' +
        (~~(rgbAverageColor[0])).toString(16).padStart(2, '0') +
        (~~(rgbAverageColor[1])).toString(16).padStart(2, '0') +
        (~~(rgbAverageColor[2])).toString(16).padStart(2, '0')
      )
      console.error(hexAverageColor)

      return hexAverageColor
    }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      series: [this.indiePercentage],
      chartOptions: ({
        chart: {
          type: 'radialBar',
          offsetY: -20,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          lineCap: 'round'
        },
        colors: [HIGHEST_VALUE_COLOR],
        plotOptions: {
          radialBar: {
            startAngle: -90,
            endAngle: 90,
            track: {
              background: '#e7e7e7',
              strokeWidth: '97%',
              margin: 5, // margin is in pixels
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                color: '#999',
                opacity: 0.6,
                blur: 2
              }
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                offsetY: 0,
                color: '#000000',
                fontSize: '36px',
                show: true
              }
            }
          }
        },
        grid: {
          padding: {
            top: -10
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'diagonal2',
            gradientToColors: [LOWEST_VALUE_COLOR],
            stops: [-0]
          }
        }
      } as ApexOptions)
    }
  }
})
</script>
