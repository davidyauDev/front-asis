<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  title: string
  mobileTitle?: string
  subtitle?: string
  icon?: string
  subtitleIcon?: string
  tone?: 'primary' | 'neutral'
  userName?: string
  showUserName?: boolean
  showLiveBadge?: boolean
  liveTooltip?: string
  liveLabel?: string
  showNotifications?: boolean
  notificationTooltip?: string
  notificationCount?: number | string | null
  notificationShortcuts?: string[]
}

interface Emits {
  (e: 'notification-click'): void
}

const props = withDefaults(defineProps<Props>(), {
  mobileTitle: undefined,
  subtitle: undefined,
  icon: undefined,
  subtitleIcon: undefined,
  tone: 'primary',
  userName: undefined,
  showUserName: true,
  showLiveBadge: true,
  liveTooltip: 'Datos actualizados',
  liveLabel: 'En vivo',
  showNotifications: true,
  notificationTooltip: 'Notificaciones',
  notificationCount: undefined,
  notificationShortcuts: undefined,
})

const emit = defineEmits<Emits>()

const { user, logout } = useAuth()
const router = useRouter()
const toast = useToast()
const colorMode = useColorMode()

const mobileTitle = computed(() => props.mobileTitle || props.title)
const displayUserName = computed(() => props.userName || user.value?.name || '')
const displayUserRole = computed(() => {
  switch (user.value?.role) {
    case 'admin':
      return 'Administrador'
    case 'moderator':
      return 'Moderador'
    case 'user':
      return 'Usuario'
    default:
      return 'Mi cuenta'
  }
})
const shouldShowUserBlock = computed(
  () => props.showLiveBadge && props.showUserName && !!displayUserName.value,
)
const hasNotificationCount = computed(
  () =>
    props.notificationCount !== undefined &&
    props.notificationCount !== null &&
    props.notificationCount !== '',
)
const userAvatar = computed(() => user.value?.avatar || { alt: displayUserName.value || 'Usuario' })

const handleLogout = async () => {
  try {
    await logout()

    toast.add({
      title: 'Sesion cerrada',
      description: 'Has cerrado sesion correctamente.',
      color: 'success',
    })

    await router.push('/login')
  } catch {
    toast.add({
      title: 'Error',
      description: 'No se pudo cerrar la sesion.',
      color: 'error',
    })
  }
}

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: displayUserName.value || 'Usuario',
      avatar: userAvatar.value,
    },
  ],
  [
    {
      label: 'Configuracion',
      icon: 'i-lucide-settings',
      onSelect: async () => {
        await router.push('/settings')
      },
    },
    {
      label: colorMode.value === 'dark' ? 'Modo claro' : 'Modo oscuro',
      icon: colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect: () => {
        colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
      },
    },
  ],
  [
    {
      label: 'Cerrar sesion',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: handleLogout,
    },
  ],
])

const toneStyles = computed(() => {
  if (props.tone === 'neutral') {
    return {
      iconOuter:
        'flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
      iconInner:
        'flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800',
      iconGlyph: 'h-[18px] w-[18px] text-gray-700 dark:text-gray-300',
      userButton:
        'hidden items-center gap-2 rounded-full border border-gray-200/80 bg-white/85 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-gray-50 md:flex dark:border-gray-700 dark:bg-gray-900/75 dark:hover:bg-gray-900',
      userMeta: 'hidden min-w-0 items-center gap-2 lg:flex',
      userRole:
        'hidden rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600 xl:inline-flex dark:bg-gray-800 dark:text-gray-300',
      userName: 'truncate text-sm font-semibold text-gray-800 dark:text-gray-100',
      userChevron: 'h-4 w-4 text-gray-400 dark:text-gray-500',
      notificationButton:
        'relative group rounded-full border border-gray-200/80 bg-white/80 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/75 dark:hover:bg-gray-900',
      notificationIcon:
        'h-5 w-5 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300',
      notificationBadge:
        'absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full border border-white bg-gray-800 px-1 text-[9px] font-medium text-white dark:border-gray-900 dark:bg-gray-200 dark:text-gray-900',
    }
  }

  return {
    iconOuter:
      'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#eef4ff] via-white to-[#dfeaff] ring-1 ring-[#cbdaf8] dark:from-[#17305a] dark:via-gray-900 dark:to-[#12284b] dark:ring-[#29426d]',
    iconInner:
      'flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3d74d4] to-[#2d5fc0]',
    iconGlyph: 'h-[18px] w-[18px] text-white',
    userButton:
      'hidden items-center gap-2 rounded-full border border-[#d7e1f5] bg-white/90 py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-[#eef4ff] md:flex dark:border-[#29426d] dark:bg-gray-900/75 dark:hover:bg-[#13203a]',
    userMeta: 'hidden min-w-0 items-center gap-2 lg:flex',
    userRole:
      'hidden rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2d5fc0] xl:inline-flex dark:bg-[#162542] dark:text-[#c9d9ff]',
    userName: 'truncate text-sm font-semibold text-gray-900 dark:text-white',
    userChevron: 'h-4 w-4 text-gray-400 dark:text-gray-500',
    notificationButton:
      'relative group rounded-full border border-[#d7e1f5] bg-white/90 transition-colors hover:bg-[#eef4ff] dark:border-[#29426d] dark:bg-gray-900/75 dark:hover:bg-[#13203a]',
    notificationIcon:
      'animate-ring h-5 w-5 text-[#47679f] transition-colors group-hover:text-[#2d5fc0] dark:text-[#9cb7f5] dark:group-hover:text-[#c9d9ff]',
    notificationBadge:
      'absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full border border-white bg-[#2d5fc0] px-1 text-[9px] font-semibold text-white dark:border-gray-900',
  }
})
</script>

<template>
  <UDashboardNavbar :ui="{ right: 'gap-3' }">
    <template #leading>
      <div class="flex items-center gap-4">
        <UDashboardSidebarCollapse />

        <div class="flex items-center gap-3 border-l border-gray-200 pl-3 dark:border-gray-800">
          <div class="hidden items-center gap-3 sm:flex">
            <div v-if="icon" :class="toneStyles.iconOuter">
              <div :class="toneStyles.iconInner">
                <UIcon
                  :name="icon"
                  :class="toneStyles.iconGlyph"
                />
              </div>
            </div>

            <div>
              <h1 class="text-[17px] font-semibold tracking-tight text-gray-900 dark:text-white">
                {{ title }}
              </h1>

              <p
                v-if="subtitle"
                class="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
              >
                <UIcon v-if="subtitleIcon" :name="subtitleIcon" class="h-3 w-3" />
                <span>{{ subtitle }}</span>
              </p>
            </div>
          </div>

          <h1 class="text-[16px] font-semibold tracking-tight text-gray-900 dark:text-white sm:hidden">
            {{ mobileTitle }}
          </h1>
        </div>
      </div>
    </template>

    <template #right>
      <div class="flex items-center gap-2">
        <slot name="right-prefix" />

        <slot name="right" />

        <UTooltip
          v-if="showNotifications"
          :text="notificationTooltip"
          :shortcuts="notificationShortcuts"
        >
          <UButton
            color="neutral"
            variant="ghost"
            square
            :class="toneStyles.notificationButton"
            class="size-10"
            @click="emit('notification-click')"
          >
            <div class="relative">
              <UIcon name="i-heroicons-bell" :class="toneStyles.notificationIcon" />

              <div v-if="hasNotificationCount" :class="toneStyles.notificationBadge">
                {{ notificationCount }}
              </div>
            </div>
          </UButton>
        </UTooltip>

        <UDropdownMenu
          v-if="shouldShowUserBlock"
          :items="userMenuItems"
          :content="{ align: 'end', side: 'bottom', collisionPadding: 12 }"
          :ui="{ content: 'min-w-56' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            :class="toneStyles.userButton"
          >
            <UAvatar
              :name="displayUserName || 'Usuario'"
              :src="userAvatar.src"
              :alt="userAvatar.alt || displayUserName || 'Usuario'"
              size="sm"
              class="ring-2 ring-white dark:ring-gray-900"
            />

            <div :class="toneStyles.userMeta">
              <p :class="toneStyles.userName">
                {{ displayUserName }}
              </p>

              <span :class="toneStyles.userRole">
                {{ displayUserRole }}
              </span>
            </div>

            <UIcon name="i-lucide-chevrons-up-down" :class="toneStyles.userChevron" />
          </UButton>
        </UDropdownMenu>
      </div>
    </template>
  </UDashboardNavbar>
</template>

<style scoped>
@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
  60% { transform: rotate(-5deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring 2s ease-in-out infinite;
  transform-origin: 50% 0%;
}
</style>
