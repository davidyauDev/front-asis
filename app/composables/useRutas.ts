import { ref, computed, onMounted } from "vue";
import type {
  Route,
  RouteFilters,
  RouteStats,
  GPSPoint,
  AttendanceUser,
  MapConfig,
} from "~/types";

const ROUTE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#14B8A6",
  "#8B5CF6",
  "#F43F5E",
  "#0EA5E9",
  "#EAB308",
  "#22C55E",
];

function generateGPSPoints(
  startLat: number,
  startLng: number,
  numPoints: number,
  startTime: Date
): GPSPoint[] {
  const points: GPSPoint[] = [];
  let currentLat = startLat;
  let currentLng = startLng;
  let currentTime = new Date(startTime);

  for (let i = 0; i < numPoints; i++) {
    if (i > 0) {
      currentLat += (Math.random() - 0.5) * 0.005;
      currentLng += (Math.random() - 0.5) * 0.005;

      const minutesAdvance = Math.random() * 2 + 1;
      currentTime = new Date(currentTime.getTime() + minutesAdvance * 60000);
    }

    points.push({
      id: `point-${i}`,
      latitude: currentLat,
      longitude: currentLng,
      timestamp: currentTime.toISOString(),
      accuracy: Math.random() * 10 + 5,
      speed: Math.random() * 50 + 20,
      altitude: 500 + Math.random() * 100,
      heading: Math.random() * 360,
    });
  }

  return points;
}

export const useRutas = () => {

  const routes = ref<Route[]>([]);
  const users = ref<AttendanceUser[]>([]);
  const selectedRoute = ref<Route | null>(null);
  const filters = ref<RouteFilters>({});
  const loading = ref(false);

  const mapConfig = ref<MapConfig>({
    center: [-12.0464, -77.0428],
    zoom: 12,
    stopMinDuration: 5,
  });

  async function fetchRoutesFromAPI() {
    loading.value = true;

    try {
      const token = localStorage.getItem("auth_token");

      const params = new URLSearchParams();
      if (filters.value.date) {
        params.append("date", filters.value.date);
      }

      const url = `http://172.19.0.17/api/users/check-in-out?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      const apiUsers = json.data || [];

      users.value = apiUsers;

      routes.value = apiUsers.map((u, index) => {
        const attendance = u.attendances[0];
        const baseLat = attendance.latitude;
        const baseLng = attendance.longitude;

        const gpsPoints = generateGPSPoints(
          baseLat,
          baseLng,
          25,
          new Date(attendance.created_at)
        );

        return {
          id: `route-${u.id}`,
          user_id: u.id,
          user: u,
          date: attendance.created_at.split(" ")[0],
          start_time: attendance.created_at,
          end_time: attendance.created_at,
          points: gpsPoints,
          stops: [], 
          total_distance: 0, 
          total_duration: 0,
          average_speed: 0,
          max_speed: 0,
          color: ROUTE_COLORS[index % ROUTE_COLORS.length],
        };
      });
    } catch (e) {
      console.error("Error al cargar rutas:", e);
    }

    loading.value = false;
  }

  onMounted(fetchRoutesFromAPI);
  console.log("tests");
  const filteredRoutes = computed(() => {
    let result = routes.value;
    if (filters.value.date) {
      result = result.filter((r) => r.date === filters.value.date);
    }

    return result;
  });

  const stats = computed<RouteStats>(() => ({
    total_routes: filteredRoutes.value.length,
    total_distance: 0,
    total_duration: 0,
    average_distance: 0,
    average_duration: 0,
  }));

  const selectRoute = (routeId: string | null) => {
    selectedRoute.value = routeId
      ? routes.value.find((r) => r.id === routeId) || null
      : null;
  };

 const updateFilters = async (newFilters: Partial<RouteFilters>) => {
  filters.value = { ...filters.value, ...newFilters };
  await fetchRoutesFromAPI(); // recargar datos con la fecha elegida
};


  const clearFilters = () => {
    filters.value = {};
    selectedRoute.value = null;
  };

  const getMapBounds = () => {
    const allPoints = filteredRoutes.value.flatMap((r) => r.points);
    if (allPoints.length === 0) return null;

    return {
      north: Math.max(...allPoints.map((p) => p.latitude)),
      south: Math.min(...allPoints.map((p) => p.latitude)),
      east: Math.max(...allPoints.map((p) => p.longitude)),
      west: Math.min(...allPoints.map((p) => p.longitude)),
    };
  };

  const getUserRoutes = (userId: number) =>
    routes.value.filter((r) => r.user_id === userId);

  return {
    routes,
    users,
    selectedRoute,
    filters,
    loading,
    mapConfig,
    filteredRoutes,
    stats,
    selectRoute,
    updateFilters,
    clearFilters,
    getMapBounds,
    getUserRoutes,
  };
};
