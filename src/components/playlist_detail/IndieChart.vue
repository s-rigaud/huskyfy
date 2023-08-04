<template>
  <div id="genre-chart-container">
    <apexchart
      :options="chartOptions"
      :series="series"
      type="radialBar"
    />
    <p
      id="genre-chart-subtitle"
      :style="{ 'color': currentAverageColor }"
    >
      {{ $t("playlist.indie-score-text") }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ApexOptions } from 'apexcharts'
import { computed, ref, watch } from 'vue'

import { HIGHEST_VALUE_COLOR, LOWEST_VALUE_COLOR, getAverageColor } from '@/utils/colors'

const props = defineProps({
  indiePercentage: {
    type: Number,
    required: true
  }
})

const series = ref([props.indiePercentage])

const chartOptions = ref<ApexOptions>({
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
})

/**
 * Get color corresponding to the indie percentage
 */
const currentAverageColor = computed((): string => {
  return getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, props.indiePercentage)
})

watch(() => props.indiePercentage, (newPercentage: number) => {
  updateChart(newPercentage)
})

const updateChart = (indiePercentage: number) => {
  series.value = [indiePercentage]
  const averageColor = getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, indiePercentage)
  chartOptions.value = {
    ...chartOptions.value,
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
  margin-top: 30px;

  color: var(--text-color)
}
</style>
