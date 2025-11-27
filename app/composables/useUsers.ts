import { createSharedComposable } from "@vueuse/core";
import type { CreateUserPayload, UserListItem } from "~/types";

const allUsers = ref<UserListItem[]>([]);

const _useUsers = () => {
  const users = ref<UserListItem[]>([]);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const toast = useToast();

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

  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  // Obtener token de autenticación
  const getAuthToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  const getAllUsers = async (): Promise<UserListItem[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("🚫 No hay token de autenticación");
        throw new Error("No hay token de autenticación");
      }
      const response = await $fetch<{ data: { users: UserListItem[] } }>(
        `${apiBaseUrl}/api/users/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      allUsers.value = response.data.users;
      return response.data.users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  };

  const getUsersNotCheckedInOutToday = async (): Promise<UserListItem[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay token de autenticación");
      }
      const response = await $fetch<{ data: { users: UserListItem[] } }>(
        `${apiBaseUrl}/api/users/not-checked-in-out-today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      return response.data.users;
    } catch (error) {
      console.error("Error fetching users not checked in/out today:", error);
      throw error;
    }
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
      params.append("page", page.toString());
      params.append("per_page", perPage.value.toString());

      if (search.trim()) params.append("search", search.trim());
      params.append("sort_by", sortByParam || sortBy.value);
      params.append("sort_order", sortOrderParam || sortOrder.value);

      const url = `${apiBaseUrl}/api/users?${params.toString()}`;

      const response = await $fetch<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // "Content-Type": "application/json",
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
    searchQuery.value = query;
    currentPage.value = 1;
    await fetchUsers(1, query, sortBy.value, sortOrder.value);
  };

  // Cambiar ordenamiento
  const changeSorting = async (
    newSortBy: string,
    newSortOrder?: "asc" | "desc"
  ) => {
    if (newSortBy === sortBy.value && !newSortOrder) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = newSortBy;
      if (newSortOrder) {
        sortOrder.value = newSortOrder;
      }
    }

    currentPage.value = 1;
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

  const getUserById = (id: number) => {
    return users.value.find((user) => user.id === id);
  };

  const getUserByEmpCode = (empCode: string) => {
    return users.value.find((user) => user.emp_code === empCode);
  };

  const formatUserForSelect = (user: UserListItem) => {
    return {
      label: `${user.name} (${user.emp_code})`,
      value: user.id,
      name: user.name,
      emp_code: user.emp_code,
      email: user.email,
    };
  };

  const getUsersForSelect = () => {
    return users.value.map(formatUserForSelect);
  };

  const searchUsersLocal = (query: string) => {
    if (!query) return users.value;

    const lowerQuery = query.toLowerCase();
    return users.value.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.emp_code.toLowerCase().includes(lowerQuery)
    );
  };

  const toggleUserActive = async (userId: number) => {
    loading.value = true;
    const user = getUserById(userId);
    if (!user) {
      loading.value = false;
      return;
    }

    try {
      const url = `${apiBaseUrl}/api/users/${userId}/toggle-active`;
      const token = getAuthToken();
      await $fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      user.active = !user.active;

      toast.add({
        title: "Estado actualizado",
        description: `El usuario ${user.name} ahora está ${
          user.active ? "activo" : "inactivo"
        }.`,
        color: "success",
      });
    } catch (err: any) {
      console.error("Error al actualizar el estado del usuario:", err);
      toast.add({
        title: "Error al actualizar estado",
        description:
          err.data?.message || "No se pudo actualizar el estado del usuario.",
        color: "error",
        duration: 5000,
      });
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (newUser: CreateUserPayload) => {
    try {
      const url = `${apiBaseUrl}/api/users`;
      const token = getAuthToken();
      const { data } = await $fetch<{
        data: UserListItem;
      }>(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      users.value = [data, ...users.value];

      // const { refresh } = await useUsersNotCheckedInOutToday();
      // await refresh();

      toast.add({
        title: "Usuario creado",
        description: `El usuario ${data.name} ha sido creado correctamente.`,
        color: "success",
      });

      return data;
    } catch (err: any) {
      toast.add({
        title: "Error al crear usuario",
        description: err.data?.message || "No se pudo crear el usuario.",
        color: "error",
        duration: 5000,
      });
      return null;
    }
  };

  const updateUserInList = async (
    id: number,
    updatedUser: CreateUserPayload
  ) => {
    const index = users.value.findIndex((user) => user.id === id);

    try {
      if (index === -1) return false;

      const url = `${apiBaseUrl}/api/users/${id}`;
      const token = getAuthToken();

      const { data } = await $fetch<{ data: UserListItem }>(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });
      users.value[index] = data;

      toast.add({
        title: "Usuario actualizado",
        description: `El usuario ${updatedUser.name} ha sido actualizado correctamente.`,
        color: "success",
      });

      return true;
    } catch (err: any) {
      // Si Laravel mandó JSON, ofetch lo guarda así:
      // console.log("👉 Detalle error backend:", err.data.message);
      // if (err.data && err.data.message) {
      toast.add({
        title: "Error al actualizar usuario",
        // message: err.data.message,
        description:
          err.data?.message || "No se pudo actualizar el usuario seleccionado.",
        color: "error",
        duration: 5000,
      });
      // }

      return false;
    }
  };

  const deleteUserFromList = async (userId: number) => {
    try {
      await $fetch(`${apiBaseUrl}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      users.value = users.value.map((user) =>
        user.id === userId
          ? { ...user, deleted_at: new Date().toISOString() }
          : user
      );

      toast.add({
        title: "Usuario eliminado",
        description: `El usuario ha sido eliminado correctamente.`,
        color: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Error al eliminar usuario",
        description:
          err.data?.message || "No se pudo eliminar el usuario seleccionado.",
        color: "error",
        duration: 5000,
      });
    }
  };

  const restoreUser = async (user: UserListItem) => {
    try {
      await $fetch(`${apiBaseUrl}/api/users/${user.id}/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      users.value = users.value.map((u) =>
        u.id === user.id ? { ...u, deleted_at: undefined } : u
      );

      toast.add({
        title: "Usuario restaurado",
        description: `El usuario ${user.name} ha sido restaurado correctamente.`,
        color: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Error al restaurar usuario",
        description:
          err.data?.message || "No se pudo restaurar el usuario seleccionado.",
        color: "error",
        duration: 5000,
      });
    }
  };

  return {
    users: readonly(users),
    allUsers: readonly(allUsers),
    loading: readonly(loading),
    error: readonly(error),

    currentPage: readonly(currentPage),
    totalPages: readonly(totalPages),
    totalUsers: readonly(totalUsers),
    paginationInfo,

    searchQuery: readonly(searchQuery),

    sortBy: readonly(sortBy),
    sortOrder: readonly(sortOrder),

    fetchUsers,
    goToPage,
    searchUsers,
    refreshUsers,
    initializeUsers,
    changePerPage,
    changeSorting,

    getAllUsers,
    getUserById,
    getUserByEmpCode,
    getUsersNotCheckedInOutToday,
    formatUserForSelect,
    getUsersForSelect,
    searchUsersLocal,
    toggleUserActive,
    createUser,
    updateUserInList,
    deleteUserFromList,
    restoreUser,
  };
};

export const useUsers = createSharedComposable(_useUsers);

const _useUsersNotCheckedInOutToday = async () => {
  return await useFetch<{
    data: UserListItem[];
  }>("/users/not-checked-in-out-today", {
    key: "users-not-checked-in-out-today",
    pick: ["data"],
    default: () => ({ data: [] }),
    cache: 'reload',
    $fetch: useNuxtApp().$api,
    lazy: true,
    dedupe: "defer",
  });
};
export const useUsersNotCheckedInOutToday = createSharedComposable(
  _useUsersNotCheckedInOutToday
);
