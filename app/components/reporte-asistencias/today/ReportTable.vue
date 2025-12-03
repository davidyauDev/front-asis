<template>
  <UTable :data="data" :columns="columns" class="shrink-0" :ui="{
    base: 'table-fixed border-separate border-spacing-0',
    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
    tbody: '[&>tr]:last:[&>td]:border-b-0',
    th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
    td: 'border-b border-default'
  }" />
</template>


<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { Sale } from '~/types'


const UBadge = resolveComponent('UBadge')

const sampleEmails = [
  'james.anderson@example.com',
  'mia.white@example.com',
  'william.brown@example.com',
  'emma.davis@example.com',
  'ethan.harris@example.com'
]

const { data } = await useAsyncData('sales', async () => {
  const sales: Sale[] = []
  const currentDate = new Date()

  for (let i = 0; i < 5; i++) {
    const hoursAgo = randomInt(0, 48)
    const date = new Date(currentDate.getTime() - hoursAgo * 3600000)

    sales.push({
      id: (4600 - i).toString(),
      date: date.toISOString(),
      status: randomFrom(['paid', 'failed', 'refunded']),
      email: randomFrom(sampleEmails),
      amount: randomInt(100, 1000)
    })
  }

  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}, {
  // watch: [() => range.value.start, () => range.value.end],
  default: () => []
})

const UButton = resolveComponent('UButton');

const sortColumButton = (column: any, label: string) => {
  const isSorted = column.getIsSorted();
  return h(UButton, {
    color: 'neutral',
    variant: 'ghost',
    label,
    icon: isSorted
      ? isSorted === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : 'i-lucide-arrow-down-wide-narrow'
      : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
  })
}


const columns: TableColumn<Sale>[] = [
  {
    accessorKey: 'dni',
    header: ({ column }) => sortColumButton(column, 'DNI'),
    cell: ({ row }) => row.getValue('dni')
  },
  {
    accessorKey: 'apellidos',
    header: ({ column }) => sortColumButton(column, 'Apellidos'),
    cell: ({ row }) => row.getValue('apellidos')
  },
  {
    accessorKey: 'nombres',
   header: ({ column }) => sortColumButton(column, 'Nombres'),
    cell: ({ row }) => row.getValue('nombres')
  },
  {
    accessorKey: 'departamento',
    header: ({ column }) => sortColumButton(column, 'Departamento'),
    cell: ({ row }) => row.getValue('departamento')
  },
  {
    accessorKey: 'empresa',
    header: ({ column }) => sortColumButton(column, 'Empresa'),
    cell: ({ row }) => row.getValue('empresa')
  },
  {
    accessorKey: 'horario',
    header: ({ column }) => sortColumButton(column, 'Horario'),
    cell: ({ row }) => row.getValue('horario')
  },
  {
    accessorKey: 'ingreso',
    header: ({ column }) => sortColumButton(column, 'Ingreso'),
    cell: ({ row }) => {
      const ingreso = row.getValue('ingreso');
      return ingreso || h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'error' }, () =>
        'Sin ingreso'
      )
    }
  },
  {
    accessorKey: 'salida',
    header: ({ column }) => sortColumButton(column, 'Salida'),
    cell: ({ row }) => {
      const salida = row.getValue('salida');
      return salida || h(UBadge, { class: 'capitalize', variant: 'subtle', color: 'error' }, () =>
        'Sin salida'
      )
    }
  },

  // {
  //   accessorKey: 'status',
  //   header: 'Status',
  //   cell: ({ row }) => {
  //     const color = {
  //       paid: 'success' as const,
  //       failed: 'error' as const,
  //       refunded: 'neutral' as const
  //     }[row.getValue('status') as string]

  //     return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
  //       row.getValue('status')
  //     )
  //   }
  // },
  // {
  //   accessorKey: 'email',
  //   header: 'Email'
  // },
  // {
  //   accessorKey: 'amount',
  //   header: () => h('div', { class: 'text-right' }, 'Amount'),
  //   cell: ({ row }) => {
  //     const amount = Number.parseFloat(row.getValue('amount'))

  //     const formatted = new Intl.NumberFormat('en-US', {
  //       style: 'currency',
  //       currency: 'EUR'
  //     }).format(amount)

  //     return h('div', { class: 'text-right font-medium' }, formatted)
  //   }
  // }
]
</script>
