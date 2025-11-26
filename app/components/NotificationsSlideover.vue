<script setup lang="ts">
import { AttendanceType } from '~/enums/attendance'
import type { UserListItem } from '~/types'

const { isNotificationsSlideoverOpen } = useDashboard()

type AttendanceTypeFilter = AttendanceType.CHECK_IN | AttendanceType.CHECK_OUT | 'unknown' | null;

const attendanceTypeFilter = ref<AttendanceTypeFilter>(null);


const { data, error, refresh } = await useUsersNotCheckedInOutToday();

// const { data, error, refresh } = await useFetch<{
//   data: UserListItem[]
// }>('/api/users/not-checked-in-out-today', {
//   key: 'users-not-checked-in-out-today',
//   pick: ['data'],
//   default: () => ({ data: [] }),
//   $fetch: useNuxtApp().$api
// })


const isCheckedIn = (user: UserListItem) => {
  return user.attendances && user.attendances[0]?.type === AttendanceType.CHECK_IN;
}

const toogleAttendanceTypeFilter = (type: AttendanceTypeFilter) => {
  if (attendanceTypeFilter.value === type) {
    attendanceTypeFilter.value = null;
  } else {
    attendanceTypeFilter.value = type;
  }
}

const variant = (type: AttendanceTypeFilter) => {
  return attendanceTypeFilter.value === type ? 'subtle' : 'outline';

}

const users = computed(() => {

  const userData = data.value.data;
  if (!userData) return [];


  if (!attendanceTypeFilter.value) {
    return userData;
  }

  return userData.filter(user => {
    if (attendanceTypeFilter.value === 'unknown') {
      return !user.attendances || user.attendances.length === 0;
    } else if (attendanceTypeFilter.value === AttendanceType.CHECK_IN) {
      return user.attendances && user.attendances.length === 1 && user?.attendances?.[0]?.type === AttendanceType.CHECK_IN;
    } else if (attendanceTypeFilter.value === AttendanceType.CHECK_OUT) {
      return user.attendances && user.attendances.length === 1 && user?.attendances?.[0]?.type === AttendanceType.CHECK_OUT;
    }
    return false;
  });
});
</script>



<template>
  <USlideover v-model:open="isNotificationsSlideoverOpen" title="Usuarios sin registro de entrada/salida hoy">
    <template #body>

      <div v-if="error" class="p-4 text-center text-sm text-red-600 flex">
        Ocurrió un error al cargar los usuarios.
        <UButton variant="link" class="underline" @click="() => refresh()" />
      </div>


      <UFieldGroup orientation="horizontal" class="w-full mb-4 flex justify-center">
        <UButton color="neutral" :variant="variant('unknown')" label="Sin registro"
          @click="() => toogleAttendanceTypeFilter('unknown')" />
        <UButton color="neutral" :variant="variant(AttendanceType.CHECK_IN)" label="Entrada"
          @click="() => toogleAttendanceTypeFilter(AttendanceType.CHECK_IN)" />
        <UButton color="neutral" :variant="variant(AttendanceType.CHECK_OUT)" label="Salida"
          @click="() => toogleAttendanceTypeFilter(AttendanceType.CHECK_OUT)" />
      </UFieldGroup>


      <!-- {{ data.data }} -->
      <!-- //    :to="`/inbox?id=${notification.id}`" -->

      <template v-else-if="users.length === 0">
        <div class="p-4 text-center text-sm text-muted">
          No hay usuarios sin registro de entrada/salida hoy.
        </div>
      </template>

      <template v-else>
        <!-- {{ users.length }} -->
        <NuxtLink v-for="user in users" :key="user.id"
          class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3">
          <!-- <UChip
          color="error"
          :show="!!notification.unread"
          inset
        > -->
          <!-- v-bind="notification.sender.avatar" -->
          <UAvatar :alt="user.name" size="md" />
          <!-- </UChip> -->

          <div class="text-sm flex-1">
            <p class="flex items-center justify-between">
              <span class="text-highlighted font-medium">{{ user.name }}</span>

              <!-- <time
            

              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date())"
            /> -->
              <!-- {{ user. }} -->


              <UBadge v-if="!user.attendances || user.attendances.length === 0" label="Sin registro" variant="outline"
                color="warning" size="sm" />
              <UBadge v-else-if="user.attendances && user.attendances.length === 1" :label="isCheckedIn(user) ? 'Entrada registrada' : 'Salida registrada'
                " variant="outline" color="info" size="sm" />

            </p>

            <p class="text-dimmed">
              {{ user.email }}
            </p>
          </div>
        </NuxtLink>
      </template>
    </template>
  </USlideover>
</template>
