<template>
  <div id="genre-chart-container">
    <apexchart type="radialBar" :options="chartOptions" :series="series" height="200"></apexchart>
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

export default defineComponent({
  name: 'IndieChart',
  props: {
    indiePercentage: Number
  },
  watch: {
    indiePercentage(newValue: number) {
      this.series = [newValue]
    }
  },
  data() {
    // All data needed to customize graph UI and data
    return {
      series: [this.indiePercentage],
      chartOptions: ({
        chart: {
          type: 'radialBar',
          height: 350,
          offsetY: -20,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          lineCap: "round",
        },
        colors: ['#F39200'],
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
                color: '#F39200',
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
            shadeIntensity: 0.4,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 53, 91]
          }
        }
      } as ApexOptions)
    }
  }
})
</script>
