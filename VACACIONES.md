# 🏖️ Módulo de Solicitud de Vacaciones

## 📋 Descripción

Módulo completo para gestionar solicitudes de vacaciones con soporte offline. Implementado siguiendo principios SOLID y Clean Code.

## ✨ Características

### ✅ Funcionalidades Implementadas

1. **Pantalla de Perfil** (`src/app/(tabs)/profile/index.tsx`)
   - Visible solo en modo CRM
   - Muestra información del operario con avatar
   - Card de vacaciones con días disponibles
   - Indicador de solicitudes pendientes de sincronización

2. **Card de Vacaciones** (`src/components/VacationCard.tsx`)
   - Muestra días disponibles y utilizados
   - Barra de progreso visual
   - Botón para solicitar vacaciones

3. **Modal de Solicitud** (`src/components/VacationRequestModal.tsx`)
   - Formulario con validación
   - Selección de fecha inicio y fin con DatePicker
   - Campo opcional para motivo
   - Validación de días disponibles
   - Confirmación antes de enviar

4. **Soporte Offline** 
   - Cola de sincronización automática
   - Almacenamiento local con AsyncStorage
   - Sincronización automática al recuperar conexión
   - Indicadores visuales de estado de sincronización

## 🏗️ Arquitectura

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**
   - Cada componente tiene una única responsabilidad
   - Servicios separados por dominio
   - Store específico para vacaciones

2. **Open/Closed Principle (OCP)**
   - Componentes extensibles mediante props
   - Fácil agregar nuevas validaciones

3. **Dependency Inversion Principle (DIP)**
   - Uso de interfaces y tipos
   - Inyección de dependencias mediante hooks

### Estructura de Archivos

```
src/
├── interfaces/
│   └── Vacation.ts              # Tipos y enums del dominio
├── stores/
│   └── vacationStore.ts         # Estado global con Zustand
├── services/
│   └── vacationService.ts       # Lógica de negocio y API
├── hooks/
│   └── useVacations.ts          # Hook personalizado
├── components/
│   ├── VacationCard.tsx         # Card reutilizable
│   └── VacationRequestModal.tsx # Modal de formulario
└── app/(tabs)/
    ├── profile/
    │   └── index.tsx            # Pantalla de perfil
    └── _layout.tsx              # Tab de perfil agregado
```

## 🔄 Sistema Offline

### Funcionamiento

1. **Creación de Solicitud Offline**
   - La solicitud se crea con `syncStatus: Pending`
   - Se guarda en AsyncStorage
   - Se muestra feedback al usuario

2. **Cola de Sincronización**
   - Todas las solicitudes pendientes se almacenan
   - Se intenta sincronizar al recuperar conexión
   - Listener de NetInfo detecta cambios de conectividad

3. **Sincronización Automática**
   - Al recuperar conexión, se procesan todas las solicitudes
   - Las exitosas se marcan como `Synced`
   - Las fallidas se marcan como `Failed` para reintentar

### Código Clave

```typescript
// Hook personalizado con sincronización
const { createVacationRequest, hasPendingSync } = useVacations();

// Listener de red
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    syncPendingRequests();
  }
});
```

## 📱 Uso

### Para el Usuario

1. Navegar a la tab "Perfil" (solo visible en CRM)
2. Ver días disponibles en la card de vacaciones
3. Presionar "Solicitar vacaciones"
4. Completar formulario:
   - Fecha inicio (requerida)
   - Fecha fin (requerida)
   - Motivo (opcional)
5. Confirmar solicitud

### Para el Desarrollador

```typescript
// Usar el hook en un componente
const {
  availableDays,
  isLoading,
  createVacationRequest,
  hasPendingSync,
} = useVacations();

// Crear una solicitud
await createVacationRequest({
  startDate: new Date('2025-12-10'),
  endDate: new Date('2025-12-20'),
  reason: 'Vacaciones de Navidad',
});
```

## 🔧 Configuración

### Variables del Sistema

- **Días totales por defecto**: 22 días
- **Cálculo de días**: Solo días laborables (excluye fines de semana)
- **Storage key**: `@vacation_requests_queue`

### Integración con API

El servicio está preparado para integrarse con endpoints reales. Actualmente usa datos mock:

```typescript
// En vacationService.ts - Reemplazar con endpoints reales
async getVacationBalance(operatorId: string): Promise<VacationBalance> {
  // TODO: Implementar
  const response = await fetch(`${this.baseUrl}/balance/${operatorId}`);
  return await response.json();
}
```

## 🎨 Diseño

- **Colores**: Usa el sistema de colores del proyecto (`colors.industrial`)
- **Espaciado**: Sistema de spacing consistente (`spacing.xs` a `spacing.xxl`)
- **Iconos**: Ionicons de Expo
- **Tipografía**: Sistema de tipografía del proyecto

## 🚀 Próximos Pasos

1. **Historial de Solicitudes**
   - Pantalla para ver solicitudes pasadas
   - Filtros por estado

2. **Notificaciones**
   - Notificación cuando se aprueba/rechaza
   - Recordatorio de sincronización pendiente

3. **Cancelación de Solicitudes**
   - Permitir cancelar solicitudes pendientes
   - Lógica de reembolso de días

4. **Backend Integration**
   - Conectar con endpoints reales
   - Manejo de errores del servidor
   - Autenticación

## 📝 Notas Técnicas

- **React Native**: Compatible con Expo
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Network Detection**: NetInfo
- **Date Picker**: @react-native-community/datetimepicker

## 🐛 Troubleshooting

**Problema**: Las solicitudes no se sincronizan
- Verificar conectividad de red
- Revisar AsyncStorage: `@vacation_requests_queue`
- Comprobar logs de consola

**Problema**: Días disponibles incorrectos
- Verificar cálculo en `calculateVacationDays`
- Revisar lógica de actualización optimista

**Problema**: Modal no se cierra
- Verificar estado `isModalVisible`
- Comprobar función `resetForm`
