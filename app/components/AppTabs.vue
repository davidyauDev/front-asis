<script setup lang="ts">
type TabValue = string | number

export interface AppTabItem {
  label: string
  value: TabValue
  badge?: string | number | null
}

interface Props {
  items: AppTabItem[]
  ariaLabel: string
  size?: 'sm' | 'md'
  listClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  listClass: '',
})

const modelValue = defineModel<TabValue>({
  required: true,
})

const listClasses = computed(() => [
  'flex gap-0 border-b-2 border-[#2d5fc0] dark:border-[#6f8fda]',
  props.listClass,
])

const buttonClasses = computed(() => {
  if (props.size === 'sm') {
    return 'rounded-none border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors first:rounded-tl-md last:rounded-tr-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5fc0]/30'
  }

  return 'rounded-none border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors first:rounded-tl-md last:rounded-tr-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5fc0]/30'
})

const activeTabClass = 'bg-[#2d5fc0] text-white border-[#2d5fc0] -mb-[2px]'
const inactiveTabClass = 'bg-[#f5f8ff] text-[#47679f] border-[#d4def3] hover:bg-[#e9f0ff] dark:bg-[#101b31] dark:text-[#d1ddfb] dark:border-[#29426d] dark:hover:bg-[#162646]'

const activeBadgeClass = 'bg-white/15 text-white ring-1 ring-white/20'
const inactiveBadgeClass = 'bg-[#2d5fc0]/10 text-[#47679f] ring-1 ring-[#2d5fc0]/15 dark:bg-[#2d5fc0]/15 dark:text-[#c0d0f7] dark:ring-[#2d5fc0]/20'
</script>

<template>
  <nav class="w-full">
    <div :class="listClasses" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(item, idx) in items"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="item.value === modelValue"
        :tabindex="item.value === modelValue ? 0 : -1"
        :class="[
          buttonClasses,
          idx ? '-ml-px' : '',
          item.value === modelValue ? activeTabClass : inactiveTabClass,
        ]"
        @click="modelValue = item.value"
      >
        {{ item.label }}

        <span
          v-if="item.badge !== undefined && item.badge !== null && item.badge !== ''"
          class="ml-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold normal-case tracking-normal"
          :class="item.value === modelValue ? activeBadgeClass : inactiveBadgeClass"
        >
          {{ item.badge }}
        </span>
      </button>
    </div>
  </nav>
</template>
