<template>
  <div id="genre-chart-container">
    <apexchart type="radialBar" :options="chartOptions" :series="series"></apexchart>
    <p id="genre-chart-subtitle" :style="{ 'color': currentAverageColor }">
      {{ $t("playlist.indie-score-text") }}
    </p>
  </div>
</template>

<style>
#genre-chart-container {
  margin-top: 15px;

  display: flex !important;
  flex-direction: column;
  align-items: center;
}

#genre-chart-container .vue-apexcharts {
  min-height: 55px !important;
  height: 55px !important;
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
    indiePercentage: {
      type: Number,
      required: true
    }
  },
  computed: {
    currentAverageColor (): string {
      return this.getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, this.indiePercentage)
    }
  },
  methods: {
    getAverageColor (color1: string, color2: string, percentage: number): string {
      const hexToRGB = (color: string): number[] => {
        return (color.replace('#', '').match(/.{1,2}/g) as RegExpMatchArray).map(hex => parseInt(hex, 16))
      }
      const rgbToHex = (rgb: number[]): string => {
        return (
          '#' +
          (~~(rgb[0])).toString(16).padStart(2, '0') +
          (~~(rgb[1])).toString(16).padStart(2, '0') +
          (~~(rgb[2])).toString(16).padStart(2, '0')
        )
      }

      const rgbColor1 = hexToRGB(color1)
      const rgbColor2 = hexToRGB(color2)

      const realPercentage = percentage / 100
      const rgbAverageColor = [
        (rgbColor1[0] * (1 - realPercentage) + rgbColor2[0] * realPercentage),
        (rgbColor1[1] * (1 - realPercentage) + rgbColor2[1] * realPercentage),
        (rgbColor1[2] * (1 - realPercentage) + rgbColor2[2] * realPercentage)
      ]

      return rgbToHex(rgbAverageColor)
    }
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
                color: LOWEST_VALUE_COLOR,
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
