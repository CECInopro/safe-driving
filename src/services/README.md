# Vehicle Service Layer

## Tổng quan

Hệ thống service layer này được thiết kế để giải quyết vấn đề "trải thẳng" dữ liệu từ backend. Thay vì phải xử lý nhiều format dữ liệu khác nhau trong từng component, giờ đây tất cả logic xử lý dữ liệu được tập trung trong service layer.

## Cấu trúc

### 1. Types (`src/types/vehicle.ts`)
- **Vehicle**: Interface chuẩn cho dữ liệu xe
- **VehicleLocation**: Interface cho thông tin vị trí
- **RawVehicleData**: Interface cho dữ liệu thô từ backend (hỗ trợ nhiều format)
- **VehicleStatus**: Enum cho trạng thái xe
- **ApiResponse**: Wrapper cho response từ API

### 2. Service (`src/services/vehicleService.ts`)
- **VehicleService**: Class chính xử lý tất cả API calls
- **Data normalization**: Tự động chuẩn hóa dữ liệu từ nhiều format khác nhau
- **Error handling**: Xử lý lỗi tập trung và thống nhất

## Lợi ích

### Trước đây (Vấn đề):
```typescript
// Phải "trải thẳng" dữ liệu trong mỗi component
const normalized: Vehicle[] = (Array.isArray(data) ? data : data?.items || []).map((v: any) => ({
    vehicleId: v.vehicleId || v.id || v.vehicle_id,
    plate: v.plate || v.plateNumber || v.plate_number,
    driver: v.driver || v.driverName || v.driver_name,
})).filter((v: Vehicle) => !!v.vehicleId);
```

### Bây giờ (Giải pháp):
```typescript
// Chỉ cần gọi service, dữ liệu đã được chuẩn hóa
const vehicles = await vehicleService.fetchVehicles();
```

## Cách sử dụng

### 1. Lấy danh sách xe
```typescript
import { vehicleService } from '../services/vehicleService';

const vehicles = await vehicleService.fetchVehicles();
// Dữ liệu đã được chuẩn hóa, không cần xử lý thêm
```

### 2. Lấy vị trí xe
```typescript
const location = await vehicleService.fetchVehicleLocation(vehicleId);
if (location) {
    console.log(`Lat: ${location.lat}, Lng: ${location.lng}`);
}
```

### 3. Lấy thông tin xe cụ thể
```typescript
const vehicle = await vehicleService.getVehicleById(vehicleId);
```

## Hỗ trợ nhiều format dữ liệu

Service tự động xử lý các format dữ liệu khác nhau từ backend:

### Vehicle ID
- `vehicleId`, `id`, `vehicle_id`

### Plate Number
- `plate`, `plateNumber`, `plate_number`

### Driver
- `driver`, `driverName`, `driver_name`

### Location
- `lat`/`lng`, `latitude`/`longitude`

### Status
- `status`, `vehicleStatus`, `vehicle_status`

### Timestamp
- `timeVehicleLog`, `time_vehicle_log`, `timestamp`

## Mở rộng

Để thêm format dữ liệu mới từ backend, chỉ cần cập nhật:
1. `RawVehicleData` interface trong `types/vehicle.ts`
2. Logic normalization trong `VehicleService.normalizeVehicleData()`

Không cần thay đổi code trong các component!
