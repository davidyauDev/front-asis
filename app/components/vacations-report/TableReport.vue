<template>
    <!-- {{ holidays }} -->




    <!-- {{ eachDayOfInterval(rangeDate) }}  -->
    <UTable :data="data" :columns="columns" class="flex-1">
        <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
                <UAvatar :src="`https://i.pravatar.cc/120?img=${row.original.id}`" size="lg"
                    :alt="`${row.original.name} avatar`" />
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
        <template #action-cell="{ row }">
            <UDropdownMenu :items="getDropdownActions(row.original)">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Actions" />
            </UDropdownMenu>
        </template>
    </UTable>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui';
import type { Column } from '@tanstack/vue-table';
import { useClipboard } from '@vueuse/core';
import { eachDayOfInterval, format, isEqual } from 'date-fns';
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
    }
}>()

const holidays = ref<Date[]>();

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
    isHoliday: holidays.value?.some(holiday =>
        isEqual(holiday, date)) ?? false
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

watch(currentYearFromMonth, async (year) => {
    const res = await $fetch<Holiday[]>(`https://date.nager.at/api/v3/PublicHolidays/${year}/PE`);
    holidays.value = res.map(d => new Date(d.date));
}, {
    immediate: true
})


const toast = useToast()
const { copy } = useClipboard()

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

const columns = computed<TableColumn<User>[]>(() => [{
    accessorKey: 'id',
    //    header: ({ column }) => getHeader(column, '#', 'left'),
    header: '#'
},
{
    accessorKey: 'name',
    header: ({ column }) => getHeader(column, 'Empleado', 'left'),

},
{
    accessorKey: 'cargo',
    header: ({ column }) => getHeader(column, 'Cargo', 'left'),
},
{
    accessorKey: 'fechaIngreso',
    header: 'F. Ingreso',

},
{
    accessorKey: 'movilidad',
    header: 'Movilidad',

},
{
    accessorKey: 'provincia',
    header: 'Provincia',

},
{
    accessorKey: 'empresa',
    header: 'Empresa',

},
...daysFromMonth.value.map(({ day, number, isHoliday }) => ({
    accessorKey: `${day}-${number}`,

    header: () => h('div', {
        class:
            `flex p-1 rounded flex-col mx-auto text-xs w-full items-center ${isHoliday ? 'bg-red-200' : ''}`
    }, [
        h('span', { class: 'text-xs' }, day),
        h('span', { class: 'text-xs font-medium' }, number)
    ])
}))

])


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

function getDropdownActions(user: User): DropdownMenuItem[][] {
    return [
        [
            {
                label: 'Copy user Id',
                icon: 'i-lucide-copy',
                onSelect: () => {
                    copy(user.id.toString())

                    toast.add({
                        title: 'User ID copied to clipboard!',
                        color: 'success',
                        icon: 'i-lucide-circle-check'
                    })
                }
            }
        ],
        [
            {
                label: 'Edit',
                icon: 'i-lucide-edit'
            },
            {
                label: 'Delete',
                icon: 'i-lucide-trash',
                color: 'error'
            }
        ]
    ]
}
</script>