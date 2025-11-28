<template>
    <div class="flex flex-col flex-1 w-full">
        <div class="flex max-sm:flex-wrap justify-between px-4 py-3.5 gap-2 border-b border-accented">
            <!-- orientation="vertical" -->
            <UTabs :orientation="width < 400 ? 'vertical' : 'horizontal'" v-model="currentReportType"
                @update:model-value="(value) => {
                    currentReportType = value as ReportType;
                }" :items="[
                    {
                        icon: 'i-lucide-layout-list',
                        label: 'Reporte semanal',
                        value: ReportType.WEEKLY
                    },
                    {
                        icon: 'i-lucide-calendar-days',
                        label: 'Detalle Diario', slot: 'diario',
                        value: ReportType.DAYLY
                    },
                ]">

                <!-- <template #semanal>
                    <WeeklyReportTable />
                </template>

<template #diario>
        <UTable ref="table" v-model:global-filter="globalFilter" :data="data" :columns="columns" />
                </template> -->

                <!-- <template #entrada>
      <TabHoraEntrada />
    </template>

<template #salida>
      <TabHoraSalida />
    </template>

<template #ubicacion>
      <TabUbicaciones />
    </template>

<template #retrasos>
      <TabRetrasos />
    </template> -->



            </UTabs>
            <div class="flex max-lg:flex-wrap max-sm:justify-end items-center gap-2">
                <UInput icon="i-lucide-search" v-model="globalFilter" class="max-w-sm"
                    placeholder="Buscar por nombre, apellido o DNI..." />
                <UButton icon="i-lucide-file-spreadsheet" class="cursor-pointer">
                    Excel
                </UButton>

                <UButton icon="i-lucide-download" class="cursor-pointer">
                    PDF
                </UButton>

                <UButton icon="i-lucide-printer" class="cursor-pointer">
                    Imprimir
                </UButton>

            </div>
        </div>

        <WeeklyReportTable v-if="currentReportType === ReportType.WEEKLY" />
        <UTable v-else-if="currentReportType === ReportType.DAYLY" ref="table" v-model:global-filter="globalFilter"
            :data="data" :columns="columns" />

    </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import WeeklyReportTable from './WeeklyReportTable.vue'
import type { TableColumn } from '@nuxt/ui'

const { width } = useWindowSize()

enum ReportType {
    WEEKLY = 'WEEKLY',
    DAYLY = 'DAYLY'
}


const currentReportType = ref<ReportType | null | undefined>(ReportType.WEEKLY)

const UBadge = resolveComponent('UBadge')

type Payment = {
    id: string
    date: string
    status: 'paid' | 'failed' | 'refunded'
    email: string
    amount: number
}

const data = ref<Payment[]>([
    {
        id: '4600',
        date: '2024-03-11T15:30:00',
        status: 'paid',
        email: 'james.anderson@example.com',
        amount: 594
    },
    {
        id: '4599',
        date: '2024-03-11T10:10:00',
        status: 'failed',
        email: 'mia.white@example.com',
        amount: 276
    },
    {
        id: '4598',
        date: '2024-03-11T08:50:00',
        status: 'refunded',
        email: 'william.brown@example.com',
        amount: 315
    },
    {
        id: '4597',
        date: '2024-03-10T19:45:00',
        status: 'paid',
        email: 'emma.davis@example.com',
        amount: 529
    },
    {
        id: '4596',
        date: '2024-03-10T15:55:00',
        status: 'paid',
        email: 'ethan.harris@example.com',
        amount: 639
    }
])

const columns: TableColumn<Payment>[] = [
    {
        accessorKey: 'id',
        header: '#',
        cell: ({ row }) => `#${row.getValue('id')}`
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
            return new Date(row.getValue('date')).toLocaleString('en-US', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const color = {
                paid: 'success' as const,
                failed: 'error' as const,
                refunded: 'neutral' as const
            }[row.getValue('status') as string]

            return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
                row.getValue('status')
            )
        }
    },
    {
        accessorKey: 'email',
        header: 'Email'
    },
    {
        accessorKey: 'amount',
        header: () => h('div', { class: 'text-right' }, 'Amount'),
        cell: ({ row }) => {
            const amount = Number.parseFloat(row.getValue('amount'))

            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount)

            return h('div', { class: 'text-right font-medium' }, formatted)
        }
    }
]

const globalFilter = ref('')
</script>
