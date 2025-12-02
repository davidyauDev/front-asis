<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisBulletLegend, VisDonutSelectors } from '@unovis/vue'

export type DataRecord = { key: string; value: number }

const data: DataRecord[] = [
  { key: 'Asistencia', value: 20 },
  { key: 'Ausencias', value: 30 },
  { key: 'Tardanzas', value: 50 },
]

const total = data.reduce((acc, d) => acc + d.value, 0)

const legendItems = data.map((d) => ({
  name: d.key,
}))
</script>

<template>
  <div class="flex gap-4 items-center">
    <VisSingleContainer :height="240" :width="240">
      <VisDonut
        :data="data"
        :value="(d: any) => d.value"
        :arcWidth="90"
        :padAngle="0.01"
        :attributes="{
          [VisDonutSelectors.segment]: {
            // Creamos un label por segmento usando elementos SVG
            'data-label': (d: DataRecord) => {
              const percent = Math.round((d.value / total) * 100)
              return `${percent}%`
            }
          }
        }"
      />
    </VisSingleContainer>

    <VisBulletLegend :items="legendItems" orientation="vertical" />
  </div>
</template>

<style>
/* Selecciona cada segmento y agrega el label como texto SVG */
.unovis-donut-segment::after {
  content: attr(data-label);
  position: absolute;
  font-size: 12px;
  color: #333;
  font-weight: bold;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
