import { createSharedComposable } from "@vueuse/core";
import type { UserListItem } from "~/types";

const _useUsers = () => {
  const users = ref<UserListItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);


  // Paginación
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalUsers = ref(0);
  const perPage = ref(10);
  const from = ref(0);
  const to = ref(0);

  // Búsqueda y filtros
  const searchQuery = ref("");
  const sortBy = ref("created_at");
  const sortOrder = ref<"asc" | "desc">("desc");

  // Configuración de la API
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl || "http://127.0.0.1:8000";

  // Obtener token de autenticación
  const getAuthToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  // Fetch usuarios desde la API
  const fetchUsers = async (
    page = 1,
    search = "",
    sortByParam?: string,
    sortOrderParam?: "asc" | "desc"
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const token = getAuthToken();
      if (!token) {
        error.value = "Token de autenticación no encontrado";
        return;
      }

      const params = new URLSearchParams();
      params.append("page", page.toString()); // ✅ enviar siempre
      params.append("per_page", perPage.value.toString());

      if (search.trim()) params.append("search", search.trim());
      params.append("sort_by", sortByParam || sortBy.value);
      params.append("sort_order", sortOrderParam || sortOrder.value);

      const url = `${apiBaseUrl}/api/users?${params.toString()}`;
      console.log("Fetching users from:", url);

      const response = await $fetch<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      users.value = response.data || [];

      if (response.meta && response.meta.pagination) {
        const pagination = response.meta.pagination;
        currentPage.value = pagination.current_page;
        totalPages.value = pagination.last_page;
        totalUsers.value = pagination.total;
        perPage.value = pagination.per_page;

        from.value = (currentPage.value - 1) * perPage.value + 1;
        to.value = from.value + (response.data?.length || 0) - 1;
      }
    } catch (err: any) {
      console.error("❌ Error completo fetching users:", err);
      console.error("❌ Error type:", typeof err);
      console.error("❌ Error stack:", err.stack);

      // Manejo más específico de errores
      if (err.statusCode === 401) {
        error.value = "Error de autenticación: Token inválido o expirado";
      } else if (err.statusCode === 404) {
        error.value = "Error 404: Endpoint de usuarios no encontrado";
      } else if (err.statusCode === 500) {
        error.value = "Error del servidor: El backend tiene problemas internos";
      } else if (err.message?.includes("fetch")) {
        error.value = "Error de conexión: No se pudo conectar al servidor";
      } else {
        error.value = err.message || "No se pudo cargar la lista de usuarios";
      }

      // Limpiar datos en caso de error
      users.value = [];
      totalUsers.value = 0;
      totalPages.value = 1;
      from.value = 0;
      to.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Ir a página específica
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      await fetchUsers(page, searchQuery.value, sortBy.value, sortOrder.value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Buscar usuarios
  const searchUsers = async (query: string) => {
    currentPage.value = 1; // Reset a primera página
    await fetchUsers(1, query, sortBy.value, sortOrder.value);
  };

  // Cambiar ordenamiento
  const changeSorting = async (
    newSortBy: string,
    newSortOrder?: "asc" | "desc"
  ) => {
    // Si es la misma columna, alternar orden
    if (newSortBy === sortBy.value && !newSortOrder) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = newSortBy;
      if (newSortOrder) {
        sortOrder.value = newSortOrder;
      }
    }

    currentPage.value = 1; // Reset a primera página al cambiar orden
    await fetchUsers(1, searchQuery.value, sortBy.value, sortOrder.value);
  };

  // Refrescar usuarios
  const refreshUsers = async () => {
    await fetchUsers(
      currentPage.value,
      searchQuery.value,
      sortBy.value,
      sortOrder.value
    );
  };

  // Inicialización rápida
  const initializeUsers = async () => {
    await fetchUsers();
  };

  // Cambiar elementos por página
  const changePerPage = async (newPerPage: number) => {
    perPage.value = newPerPage;
    currentPage.value = 1; // Reset a primera página
    await fetchUsers(1, searchQuery.value, sortBy.value, sortOrder.value);
  };

  // Información de paginación computed
  const paginationInfo = computed(() => ({
    current: currentPage.value,
    total: totalPages.value,
    from: from.value,
    to: to.value,
    totalItems: totalUsers.value,
    perPage: perPage.value,
  }));

  // 🔧 Utilidades adicionales para filtros de asistencia
  const getUserById = (id: number) => {
    return users.value.find(user => user.id === id)
  }

  const getUserByEmpCode = (empCode: string) => {
    return users.value.find(user => user.emp_code === empCode)
  }

  const formatUserForSelect = (user: UserListItem) => {
    return {
      label: `${user.name} (${user.emp_code})`,
      value: user.id,
      name: user.name,
      emp_code: user.emp_code,
      email: user.email
    }
  }

  const getUsersForSelect = () => {
    return users.value.map(formatUserForSelect)
  }

  const searchUsersLocal = (query: string) => {
    if (!query) return users.value
    
    const lowerQuery = query.toLowerCase()
    return users.value.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.emp_code.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    // Datos
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),

    // Paginación
    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalUsers: readonly(totalUsers),
    paginationInfo,

    // Búsqueda
    searchQuery: readonly(searchQuery),

    // Ordenamiento
    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),

    // Métodos
    fetchUsers,
    goToPage,
    searchUsers,
    refreshUsers,
    initializeUsers,
    changePerPage,
    changeSorting,

    // Utilidades adicionales
    getUserById,
    getUserByEmpCode,
    formatUserForSelect,
    getUsersForSelect,
    searchUsersLocal,
  };
};

export const useUsers = createSharedComposable(_useUsers);
