<template>
    <UTable :data="data" :columns="columns" class="flex-1" ref="table" v-model:pagination="pagination"
        :pagination-options="{
            getPaginationRowModel: getPaginationRowModel()
        }">
        <template v-for="{ day, isHoliday, number } in daysFromMonth" #[`${day}_${number}-header`]>
            <div class="flex p-1 rounded flex-col mx-auto text-xs w-full items-center" :class="{
                'bg-red-500/20 border border-red-500/30': isHoliday,
                'bg-blue-500/20 border border-blue-500/30': day === 'DOM'
            }">
                <span class="text-xs">
                    {{ day }}
                </span>
                <span class="text-xs font-medium">
                    {{ number }}
                </span>
            </div>
        </template>

        <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
                <UAvatar size="lg" :alt="row.original.name" />
                <div>
                    <p class="font-medium text-highlighted">
                        {{ row.original.name }}
                    </p>
                    <p>
                        {{ row.original.position }}
                    </p>
                </div>

                <!-- @click="copy(row.original.email)" -->
                <UButton icon="i-lucide-eye" variant="link" size="sm" class="ml-auto cursor-pointer"
                    @click="open = true" />
            </div>
        </template>
    </UTable>


    <div class="flex items-center justify-between p-4">

        <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span class="font-medium">{{ getStats().start }}</span> - <span class="font-medium">{{
                getStats().end }}</span>
            de <span class="font-medium">{{ getStats().total }}</span> registros
        </div>
        <div class="flex justify-end border-t border-default">
            <UPagination :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { getPaginationRowModel, type Column } from '@tanstack/vue-table';
import { eachDayOfInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';
interface User {
    id: number
    name: string
    position: string
    email: string
    role: string
}

const open = defineModel('open', {
    type: Boolean,
    required: true
})

const { rangeDate } = defineProps<{
    rangeDate: {
        start: Date,
        end: Date
    },
    searchTerm: string
}>()



const holidays = ref<string[]>();

// const datesArray = eachDayOfInterval(rangeDate);
const currentYearFromMonth = computed(() => format(rangeDate.start, 'yyyy', {
    locale: es
}))

const daysFromMonth = computed(() => eachDayOfInterval(rangeDate).map((date) => ({
    day: format(date, 'eee', {
        locale: es
    }).toUpperCase(),
    number: format(date, 'dd', {
        locale: es
    }),
    isHoliday: holidays.value?.some(holiday => {
        const onlyDate = format(date, 'yyyy-MM-dd');
        return onlyDate === holiday
    }) || false
})));



type Holiday = {
    date: string
    localName: string
    name: string
    countryCode: string
    fixed: boolean
    global: boolean
    counties: string[] | null
    launchYear: number | null
    types: string[]
}


const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})


const table = useTemplateRef('table');

const getStats = () => {
    const pageIndex = table?.value?.tableApi?.getState().pagination.pageIndex || 0;
    const pageSize = table?.value?.tableApi?.getState().pagination.pageSize || 10;
    const total = table?.value?.tableApi?.getFilteredRowModel().rows.length || 0;

    const start = total === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);
    return {
        total,
        end,
        start
    }
}


watch(currentYearFromMonth, async (year) => {
    const res = await $fetch<Holiday[]>(`https://date.nager.at/api/v4/PublicHolidays/${year}/PE`);
    holidays.value = res.map(d => d.date);
}, {
    immediate: true
})


const UButton = resolveComponent('UButton')


const data = ref<User[]>([
    {
        id: 1,
        name: 'Lindsay Walton',
        position: 'Front-end Developer',
        email: 'lindsay.walton@example.com',
        role: 'Member'
    },
    {
        id: 2,
        name: 'Courtney Henry',
        position: 'Designer',
        email: 'courtney.henry@example.com',
        role: 'Admin'
    },
    {
        id: 3,
        name: 'Tom Cook',
        position: 'Director of Product',
        email: 'tom.cook@example.com',
        role: 'Member'
    },
    {
        id: 4,
        name: 'Whitney Francis',
        position: 'Copywriter',
        email: 'whitney.francis@example.com',
        role: 'Admin'
    },
    {
        id: 5,
        name: 'Leonard Krasner',
        position: 'Senior Designer',
        email: 'leonard.krasner@example.com',
        role: 'Owner'
    },
    {
        id: 6,
        name: 'Floyd Miles',
        position: 'Principal Designer',
        email: 'floyd.miles@example.com',
        role: 'Member'
    }
])

const columns = computed<TableColumn<User>[]>(() => {
    const base: TableColumn<User>[] = [
        { accessorKey: 'id', header: '#' },
        { accessorKey: 'name', header: ({ column }) => getHeader(column, 'Empleado', 'left') },
        { accessorKey: 'cargo', header: ({ column }) => getHeader(column, 'Cargo', 'left') },
        { accessorKey: 'fechaIngreso', header: 'F. Ingreso' },
        { accessorKey: 'movilidad', header: 'Movilidad' },
        { accessorKey: 'provincia', header: 'Provincia' },
        { accessorKey: 'empresa', header: 'Empresa' },
    ]

    // FORZAR reevaluación
    const days = daysFromMonth.value

    const dynamicCols = days.map(({ day, number }) => ({
        accessorKey: `${day}_${number}`,
        header: `${day} ${number}`,
    }))

    return [...base, ...dynamicCols]
})


function getHeader(column: Column<any>, label: string, position: 'left' | 'right') {
    const isPinned = column.getIsPinned()

    return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin',
        class: '-mx-2.5',
        onClick() {
            column.pin(isPinned === position ? false : position)
        }
    })
}
</script>