<template>


    <!-- Tabla -->
    <UTable sticky :data="rows" :columns="columns" ref="table" :ui="{
        th: 'p-0 w-1',
        td: 'p-0'



    }" v-model:pagination="pagination" :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
    }">


    </UTable>
    <!-- Info de registros -->
    <div class="flex items-center justify-between p-4">

        <div class="text-sm text-gray-600 dark:text-gray-400">
            Mostrando <span class="font-medium">1</span> - <span class="font-medium">1</span>
            de <span class="font-medium">2</span> registros
        </div>
        <div class="flex justify-end border-t border-default">
            <UPagination :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                :total="table?.tableApi?.getFilteredRowModel().rows.length"
                @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
    </div>

    {{ pagination }} {{ table?.tableApi?.getState().pagination.pageSize }}
</template>

<script setup lang="ts">
import TableHeaderUserFieldsGroup from './TableHeaderUserFieldsGroup.vue';
import TableCellUserFieldsGroup from './TableCellUserFieldsGroup.vue';
import TableHeaderWeekGroup from './TableHeaderWeekGroup.vue';
// import { h } from 'vue'
// import type { TableColumn } from '@nuxt/ui';
// const columns: TableColumn<any>[] = [
//     {
//         accessorKey: 'dni', header: () => h('div', {
//             class:"bg-gray-500"
//         },

//             [
//                 h('div', {
//                 class: 'bg-red-500'
//             }),
//                 h('div', {
//                 class: 'bg-red-500'
//             }, "hola")
//             ]

//         )
//     },
//     { accessorKey: 'apellidos', header: 'Apellidos' },
//     { accessorKey: 'nombre', header: 'Nombre' },
//     { accessorKey: 'departamento', header: 'Departamento' },
//     { accessorKey: 'empresa', header: 'Empresa' },

//     // 2da semana
//     { accessorKey: 'w2_tardanza', header: 'TARDANZA', },
//     { accessorKey: 'w2_trabajado', header: 'TRABAJADO', },

//     // 3era seman
//     { accessorKey: 'w3_tardanza', header: 'TARDANZA' },
//     { accessorKey: 'w3_trabajado', header: 'TRABAJADO' },

//     // 4ta semana
//     { accessorKey: 'w4_tardanza', header: 'TARDANZA' },
//     { accessorKey: 'w4_trabajado', header: 'TRABAJADO' },

//     // Totales
//     { accessorKey: 'total_tardanza', header: 'TARDANZA' },
//     { accessorKey: 'total_trabajado', header: 'TRABAJADO' },
// ]

import { getPaginationRowModel } from '@tanstack/vue-table'
import { h, } from 'vue'
import type { TableColumn } from '@nuxt/ui';

const pagination = ref({
    pageIndex: 0,
    pageSize: 1
})


const table = useTemplateRef('table')

const columns: TableColumn<any>[] = [
    // ==== COLUMNA 1: PERÍODO ====
    {
        accessorKey: 'user-fieds',
        id: 'user-fieds',
        header: () =>
            h(
                TableHeaderUserFieldsGroup
            ),
        cell: (row) => {
            return h(
                TableCellUserFieldsGroup, {
                user: row.cell.row.original
            }
            );
        }
    },

    {

        accessorKey: 'week-one',
        id: 'week-one',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '1era Semana',
                gradiantBackgroundColor: 'from-rose-500 to-rose-600',
                date: '23/10 - 01/11',
                firstBackgroundColor: 'bg-rose-100',
                secondBackgroundColor: 'bg-rose-50',
                firstColor: 'text-rose-700',
                secondColor: 'text-rose-800'

            }
            ),
    },

    {
        accessorKey: 'week-two',
        id: 'week-two',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '2da Semana',
                gradiantBackgroundColor: 'from-amber-500 to-amber-600',
                date: '02/11 - 08/11',
                firstBackgroundColor: 'bg-amber-100',
                secondBackgroundColor: 'bg-amber-50',
                firstColor: 'text-amber-700',
                secondColor: 'text-amber-800'
            }
            ),
    },

    {
        accessorKey: 'week-three',
        id: 'week-three',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '3ra Semana',
                gradiantBackgroundColor: 'from-emerald-500 to-emerald-600',
                date: '02/11 - 08/11',
                firstBackgroundColor: 'bg-emerald-100',
                secondBackgroundColor: 'bg-emerald-50',
                firstColor: 'text-emerald-700',
                secondColor: 'text-emerald-800'
            }
            ),
    },

    {
        accessorKey: 'week-four',
        id: 'week-four',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: '4ta Semana',
                gradiantBackgroundColor: 'from-fuchsia-500 to-fuchsia-600',
                date: '02/11 - 08/11',
                firstBackgroundColor: 'bg-fuchsia-100',
                secondBackgroundColor: 'bg-fuchsia-50',
                firstColor: 'text-fuchsia-700',
                secondColor: 'text-fuchsia-800'
            }
            ),
    },
     {
        accessorKey: 'totals',
        id: 'totas',
        header: () =>
            h(
                TableHeaderWeekGroup, {
                week: 'TOTALES',
                gradiantBackgroundColor: 'from-slate-600 to-slate-700',
                date: '02/11 - 08/11',
                firstBackgroundColor: 'bg-slate-100',
                secondBackgroundColor: 'bg-slate-50',
                firstColor: 'text-slate-700',
                secondColor: 'text-slate-800'
            }
            ),
    },

]

//  <div class="w-full h-full">


//         <div
//             class="bg-gradient-to-r h-12 from-amber-500 w-full to-amber-600 text-white text-center py-3 font-bold text-xs tracking-wide">
//             2da Semana
//         </div>
//         <div class="bg-amber-100   text-center p-2">

//             <span class="w-full text-xs text-amber-700">

//                 02/11 - 08/11
//             </span>

//         </div>
//         <div class="w-full flex">

//             <span
//                 class="w-1/2 block px-2 py-5 text-center bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
//                 Tardanza</span>
//             <span
//                 class="w-1/2 block px-2 py-5 text-center bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
//                 Trabajado</span>

//         </div>

//     </div>



const rows = [
    {
        dni: '78994384',
        apellidos: 'Yauri Lapa',
        nombre: 'David',
        departamento: 'Sistemas_C',
        empresa: 'Cechriza SAC',
        w2_tardanza: '01:30:12',
        w2_trabajado: '42:29:58',
        w3_tardanza: '01:33:00',
        w3_trabajado: '39:24:45',
        w4_tardanza: '00:41:52',
        w4_trabajado: '40:11:15',
        total_tardanza: '5:32:56',
        total_trabajado: '177:26:06'
    },
    {
        dni: '7899438433333',
        apellidos: 'Yauri Lapa',
        nombre: 'David',
        departamento: 'Sistemas_C',
        empresa: 'Cechriza SAC',
        w2_tardanza: '01:30:12',
        w2_trabajado: '42:29:58',
        w3_tardanza: '01:33:00',
        w3_trabajado: '39:24:45',
        w4_tardanza: '00:41:52',
        w4_trabajado: '40:11:15',
        total_tardanza: '5:32:56',
        total_trabajado: '177:26:06'
    },
    {
        dni: '73829648',
        apellidos: 'Reyes Pilco',
        nombre: 'Werner Reynaldo',
        departamento: 'Sistemas_C',
        empresa: 'Cechriza SAC',
        w2_tardanza: '41:05:56',
        w2_trabajado: '—',
        w3_tardanza: '44:15:49',
        w3_trabajado: '—',
        w4_tardanza: '40:47:28',
        w4_trabajado: '44:37:04',
        total_tardanza: '0:00:00',
        total_trabajado: '186:55:38'
    },
]
</script>

<style>
/* Ajustar ancho fijo por columna en UTable */
.ut-table th,
.ut-table td {
    white-space: nowrap;
}
</style>
