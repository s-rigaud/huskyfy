<template>
  <div id="genre-chart-container">
    <apexchart
      type="radialBar"
      :options="chartOptions"
      :series="series"
    />
    <p
      id="genre-chart-subtitle"
      :style="{ 'color': currentAverageColor }"
    >
      {{ $t("playlist.indie-score-text") }}
    </p>
  </div>
</template>

<script lang="ts">
import { ApexOptions } from 'apexcharts'
import { defineComponent } from 'vue'

import { getAverageColor } from '@/utils/colors'

export const LOWEST_VALUE_COLOR = '#f35800'
export const HIGHEST_VALUE_COLOR = '#21f92e'

export default defineComponent({
  name: 'IndieChart',
  props: {
    indiePercentage: {
      type: Number,
      required: true
    }
  },
  data () {
    // All data needed to customize graph UI and data
    return {
      series: [this.indiePercentage],
      chartOptions: ({
        chart: {
          type: 'radialBar',
          offsetY: 0,
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
                fontSize: '30px',
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
  },
  computed: {
    /**
     * Get color corresponding to the indie percentage
     */
    currentAverageColor (): string {
      return getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, this.indiePercentage)
    }
  },
  watch: {
    indiePercentage (newPercentage: number) {
      this.updateChart(newPercentage)
    }
  },
  methods: {
    updateChart (indiePercentage: number) {
      this.series = [indiePercentage]
      const averageColor = getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, indiePercentage)
      this.chartOptions = {
        ...this.chartOptions,
        ...{
          colors: [averageColor],
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  color: averageColor
                }
              }
            }
          }
        }
      }
    }
  }
})
</script>

<style>
#genre-chart-container {
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
  margin-top: 20px;

  color: var(--text-color)
}
</style>
