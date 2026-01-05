# Luồng Chức Năng - Ứng Dụng Safe-Driving

## 📋 Tổng Quan
Ứng dụng Safe-Driving là hệ thống quản lý lái xe an toàn, bao gồm quản lý tài khoản, tài xế, xe, tuyến đường, chuyến đi và thông báo vi phạm.

---

## 🔐 1. Xác Thực & Phân Quyền

### 1.1. Luồng Đăng Nhập
**Trang:** `/login`

**Luồng:**
1. Người dùng truy cập trang Welcome (`/`)
2. Click "Bắt đầu" → Chuyển đến `/login`
3. Nhập `username` và `password`
4. Hệ thống gọi API: `POST /api/v1/auth/login`
5. Nếu thành công:
   - Lưu token và thông tin user vào `localStorage` (key: `safe-driving-auth`)
   - Lưu thông tin: `accountId`, `username`, `role`, `token`
   - Chuyển hướng đến `/home`
6. Nếu thất bại: Hiển thị thông báo lỗi

**Phân quyền:**
- `ADMIN`: Toàn quyền truy cập
- `MANAGER`: Quyền quản lý (không có quyền admin)
- `DRIVER`: Quyền hạn chế

### 1.2. Protected Routes
**Component:** `ProtectedRoute`

**Luồng:**
1. Kiểm tra `isAuthenticated` từ `AuthContext`
2. Nếu chưa đăng nhập → Chuyển đến `/login`
3. Nếu route yêu cầu `requiredRole="admin"`:
   - Kiểm tra `isAdmin` (ADMIN hoặc MANAGER)
   - Nếu không đủ quyền → Chuyển đến `/home`
4. Nếu đủ điều kiện → Hiển thị nội dung

---

## 🏠 2. Trang Chủ (Home)

**Trang:** `/home`

**Luồng:**
1. Hiển thị dashboard với các biểu đồ thống kê:
   - **Biểu đồ người dùng mới theo tháng**: Số lượng tài khoản mới
   - **Biểu đồ vi phạm theo tháng**: 
     - `lateTripCount`: Chuyến đi muộn
     - `alcoholViolationCount`: Vi phạm nồng độ cồn
     - `somnolenceViolationCount`: Vi phạm buồn ngủ
     - `totalViolationCount`: Tổng vi phạm
   - **Biểu đồ chuyến đi theo tháng**: Số chuyến đi hoàn thành

2. Dữ liệu được lấy từ hook `useHome()`:
   - `usersByMonth`: Người dùng theo tháng
   - `tripsByMonth`: Chuyến đi theo tháng
   - `violationsByMonth`: Vi phạm theo tháng

---

## 👥 3. Quản Lý Người Dùng (User Manager)

**Trang:** `/user-manager`  
**Quyền:** Chỉ ADMIN

### 3.1. Xem Danh Sách Tài Khoản
**Luồng:**
1. Load danh sách tài khoản từ API: `GET /api/v1/accounts`
2. Hiển thị bảng với các cột:
   - Username
   - Password
   - Role
   - Actions (Sửa/Xóa)
3. Tìm kiếm theo username (filter real-time)

### 3.2. Tạo Tài Khoản Mới
**Luồng:**
1. Click nút "+ Thêm"
2. Mở form `CreateAccountForm`
3. Nhập thông tin:
   - Username
   - Password
   - Role (ADMIN/MANAGER/DRIVER)
4. Submit → Gọi API tạo tài khoản
5. Nếu thành công:
   - Đóng form
   - Hiển thị thông báo thành công
   - Refresh danh sách

### 3.3. Sửa Tài Khoản
**Luồng:**
1. Click nút "Sửa" trên dòng tài khoản
2. Mở form `EditAccountForm` với dữ liệu hiện tại
3. Chỉnh sửa thông tin
4. Submit → Gọi API: `PATCH /api/v1/accounts/{accountId}`
5. Nếu thành công:
   - Đóng form
   - Hiển thị thông báo
   - Cập nhật danh sách

### 3.4. Xóa Tài Khoản
**Luồng:**
1. Click nút "Xóa"
2. Xác nhận xóa (confirm dialog)
3. Gọi API: `DELETE /api/v1/accounts/{accountId}`
4. Nếu thành công:
   - Xóa khỏi danh sách
   - Hiển thị thông báo

---

## 🚗 4. Quản Lý Tài Xế (Driver Manager)

**Trang:** `/driver-manager`  
**Quyền:** Chỉ ADMIN

### 4.1. Xem Danh Sách Tài Xế
**Luồng:**
1. Load danh sách tài xế và xe từ API
2. Hiển thị bảng với các cột:
   - Ảnh
   - Họ tên
   - Xe đang lái
   - Email
   - SĐT
   - Ngày sinh
   - Ngày tuyển
   - Hoạt động (Sửa/Xóa/Quét thẻ)
3. Tìm kiếm theo: tên, email, SĐT, xe

### 4.2. Tạo Tài Xế Mới
**Luồng:**
1. Click nút "+ Thêm"
2. Mở form `CreateDriverForm`
3. Nhập thông tin:
   - First Name, Last Name
   - Date of Birth
   - Gender
   - Email, Phone
   - Hire Date
   - Vehicle (tùy chọn)
   - License Class ID
   - Image (upload ảnh)
4. Submit → Gọi API tạo tài xế
5. Nếu thành công:
   - Đóng form
   - Refresh danh sách

### 4.3. Sửa Tài Xế
**Luồng:**
1. Click nút "Sửa"
2. Mở form `EditDriverForm` với dữ liệu hiện tại
3. Chỉnh sửa thông tin (có thể thay đổi xe, upload ảnh mới)
4. Submit → Gọi API cập nhật
5. Nếu thành công:
   - Đóng form
   - Cập nhật danh sách

### 4.4. Xóa Tài Xế
**Luồng:**
1. Click nút "Xóa"
2. Xác nhận xóa
3. Gọi API xóa tài xế
4. Nếu thành công:
   - Xóa khỏi danh sách
   - Hiển thị thông báo

### 4.5. Quét Thẻ (RFID Card)
**Luồng:**
1. Click nút "Quét thẻ" trên dòng tài xế
2. Kiểm tra kết nối MQTT
3. Gửi `driverId` qua MQTT topic: `esp32/write`
4. Hiển thị overlay "Vui lòng quét thẻ trên màn hình..."
5. Lắng nghe message từ MQTT topic: `esp32/status`
6. Khi nhận được:
   - "Ghi dữ liệu thành công" → Hiển thị "Quét thẻ thành công!" → Đóng overlay sau 2s
   - "Ghi dữ liệu thất bại" → Hiển thị "Quét thẻ thất bại"
   - "Chạm thẻ" → Hiển thị thông báo chờ quét

---

## 🛣️ 5. Quản Lý Tuyến Đường (Route Manager)

**Trang:** `/route-manager`  
**Quyền:** Tất cả người dùng đã đăng nhập

### 5.1. Xem Danh Sách Tuyến Đường
**Luồng:**
1. Load danh sách tuyến từ API
2. Hiển thị bảng với các cột:
   - Code
   - Tên chuyến đi
   - Quãng đường (km)
   - Stop (Xem/Thêm)
3. Tìm kiếm theo tên tuyến

### 5.2. Tạo Tuyến Đường Mới
**Luồng:**
1. Click nút "+ Thêm"
2. Mở form `CreateRouteForm`
3. Nhập thông tin:
   - Route Name
   - Code (tùy chọn)
   - Các điểm dừng (stops)
4. Submit → Gọi API tạo tuyến
5. Nếu thành công:
   - Đóng form
   - Refresh danh sách

### 5.3. Xem Chi Tiết Tuyến (Bản Đồ)
**Luồng:**
1. Click icon mắt (👁️) trên dòng tuyến
2. Mở modal `RouteMapModal`
3. Load thông tin tuyến và các điểm dừng
4. Hiển thị bản đồ Leaflet với:
   - Đường đi giữa các điểm dừng
   - Marker cho từng điểm dừng
   - Thông tin chi tiết từng điểm

### 5.4. Thêm Điểm Dừng (Stop)
**Luồng:**
1. Click icon "+" trên cột Stop
2. Mở form `CreateStopForm` với `routeId` đã chọn
3. Nhập thông tin điểm dừng:
   - Tên điểm dừng
   - Vị trí (latitude, longitude)
   - Thứ tự (sequence)
4. Submit → Gọi API tạo điểm dừng
5. Nếu thành công:
   - Đóng form
   - Cập nhật danh sách

---

## 🚌 6. Quản Lý Chuyến Đi (Trip Manager)

**Trang:** `/trip-manager`  
**Quyền:** Tất cả người dùng đã đăng nhập

### 6.1. Xem Danh Sách Chuyến Đi
**Luồng:**
1. Load danh sách chuyến đi kèm thông tin gán tài xế
2. Hiển thị bảng với các cột:
   - Code
   - Tên chuyến đi
   - Tài xế thực hiện
   - Xe thực hiện
   - Dự kiến bắt đầu/kết thúc
   - Thực tế bắt đầu/kết thúc
   - Trạng thái (Chưa bắt đầu/Đang diễn ra/Đã kết thúc)
   - Thao tác (Xem/Gán tài xế)
3. Tìm kiếm theo code hoặc tên tuyến

### 6.2. Tạo Chuyến Đi Mới
**Luồng:**
1. Click nút "+ Thêm"
2. Mở form `CreateTripForm`
3. Nhập thông tin:
   - Route (chọn từ danh sách)
   - Code
   - Planned Start Time
   - Planned End Time
4. Submit → Gọi API tạo chuyến đi
5. Nếu thành công:
   - Đóng form
   - Refresh danh sách

### 6.3. Xem Chi Tiết Chuyến Đi (Bản Đồ)
**Luồng:**
1. Click icon mắt (👁️) trên dòng chuyến đi
2. Mở modal `TripMapModal`
3. Load thông tin chuyến đi:
   - Tuyến đường
   - Vị trí thực tế của xe (nếu đang diễn ra)
   - Các điểm dừng
   - Thời gian bắt đầu/kết thúc
4. Hiển thị bản đồ với:
   - Đường đi dự kiến
   - Vị trí xe real-time (nếu có)
   - Các điểm dừng

### 6.4. Gán Tài Xế Cho Chuyến Đi
**Luồng:**
1. Click icon "+" (gán tài xế) trên chuyến đi chưa có tài xế
2. Mở form `AssignDriverForm`
3. Chọn:
   - Driver (từ danh sách tài xế)
   - Vehicle (từ danh sách xe)
4. Submit → Gọi API gán tài xế
5. Nếu thành công:
   - Đóng form
   - Cập nhật danh sách (hiển thị tài xế và xe)

---

## 🚙 7. Quản Lý Xe (Vehicle Manager)

**Trang:** `/vehicle-manager`  
**Quyền:** Chỉ ADMIN

### 7.1. Xem Danh Sách Xe
**Luồng:**
1. Load danh sách xe từ API
2. Hiển thị bảng với các cột:
   - Code
   - Mô tả (Tên)
   - Biển số xe
   - Actions (Xem)
3. Tìm kiếm theo: code, tên, biển số

### 7.2. Tạo Xe Mới
**Luồng:**
1. Click nút "+ Thêm"
2. Mở form `CreateVehicleForm`
3. Nhập thông tin:
   - Plate Number (Biển số)
   - VIN
   - Vehicle Type ID
   - Odometer (Km)
   - Status
4. Submit → Gọi API tạo xe
5. Nếu thành công:
   - Đóng form
   - Hiển thị thông báo
   - Refresh danh sách

### 7.3. Xem Chi Tiết Xe (Vị Trí & Camera)
**Luồng:**
1. Click icon mắt (👁️) trên dòng xe
2. Mở modal `VehicleMapModal`
3. Load thông tin:
   - Vị trí hiện tại của xe (từ API real-time)
   - Camera feed (nếu có)
4. Hiển thị:
   - Bản đồ với marker vị trí xe
   - Video stream từ camera xe
   - Thông tin: biển số, device ID

---

## 🔔 8. Thông Báo (Notification)

**Trang:** `/notification`  
**Quyền:** Chỉ ADMIN

### 8.1. Xem Danh Sách Thông Báo
**Luồng:**
1. Load thông báo từ `localStorage` (key: `fcm_notifications`)
2. Hiển thị danh sách với:
   - Title, Body
   - Topic badge (Cần phản hồi/Vi phạm/Thông tin)
   - Thời gian
   - Chi tiết: Biển số xe, Device ID, Tài xế, Email, SĐT
   - Actions (Xóa/Xem xe/Chấp nhận/Từ chối)

### 8.2. Các Loại Thông Báo

#### 8.2.1. Thông Báo Yes/No (Cần Phản Hồi)
**Topic:** `yesno` hoặc `NotificationConfirm`

**Luồng:**
1. Nhận thông báo từ Firebase Cloud Messaging (FCM)
2. Lưu vào `localStorage`
3. Hiển thị với badge "Cần phản hồi"
4. Có 2 nút:
   - **Chấp nhận**: Gửi `decision="1"` → API `POST /api/v1/verify/confirm-update-vehicle/1`
   - **Từ chối**: Gửi `decision="0"` → API `POST /api/v1/verify/confirm-update-vehicle/0`
5. Sau khi phản hồi:
   - Đánh dấu `responded: true`
   - Badge chuyển thành "Đã phản hồi"
   - Ẩn nút Chấp nhận/Từ chối

#### 8.2.2. Thông Báo Vi Phạm
**Topic:** `violation` hoặc `NotificationViolation`

**Luồng:**
1. Nhận thông báo vi phạm từ FCM
2. Lưu vào `localStorage`
3. Hiển thị với badge "Vi phạm"
4. Có nút "Xem xe":
   - Tìm xe theo biển số
   - Mở `VehicleMapModal` để xem vị trí và camera

#### 8.2.3. Thông Báo Thông Tin
**Topic:** `info` hoặc `NotificationInfo`

**Luồng:**
1. Nhận thông báo thông tin từ FCM
2. Lưu vào `localStorage`
3. Hiển thị với badge "Thông tin"
4. Chỉ có thể xem và xóa

### 8.3. Xử Lý Thông Báo Real-time

#### 8.3.1. Foreground Message (Ứng dụng đang mở)
**Luồng:**
1. Firebase `onMessage` listener được khởi tạo trong `HomeLayout`
2. Khi nhận message:
   - Lưu vào `localStorage` (gọi `saveNotification`)
   - Tự động chuyển đến trang `/notification`
   - Hiển thị thông báo

#### 8.3.2. Background Message (Ứng dụng ở background)
**Luồng:**
1. Service Worker (`firebase-messaging-sw.js`) xử lý
2. Khi nhận message:
   - Gửi event đến main thread
   - Main thread lắng nghe và lưu vào `localStorage`
   - Khi mở ứng dụng, thông báo sẽ hiển thị

### 8.4. Xóa Thông Báo
**Luồng:**
1. Click nút "Xóa"
2. Xóa khỏi `localStorage`
3. Cập nhật danh sách ngay lập tức

### 8.5. Đăng Ký FCM Token
**Luồng:**
1. Khi ứng dụng khởi động (`main.tsx`):
   - Gọi `initNotification()`
   - Lấy FCM token từ Firebase
   - Gửi token về server: `PATCH /api/v1/accounts/{accountId}/token`
2. Token được lưu trên server để gửi thông báo

---

## 🔧 9. Cập Nhật Firmware

**Trang:** `/update-firmware`  
**Quyền:** Tất cả người dùng đã đăng nhập

### 9.1. Upload Firmware
**Luồng:**
1. Chọn file firmware (binary file)
2. Nhập mô tả (tùy chọn)
3. Click "Cập nhật ngay"
4. Gửi request:
   - Method: `POST`
   - URL: `http://ALB-2931116.ap-southeast-1.elb.amazonaws.com/api/v1/firmware`
   - Body: `FormData` (file + description)
   - Headers: Authorization token, x-request-id
5. Nếu thành công:
   - Hiển thị "Cập nhật firmware thành công!"
6. Nếu thất bại:
   - Hiển thị "Cập nhật firmware thất bại."

---

## 🗺️ 10. Các Component Bản Đồ

### 10.1. RouteMapModal
**Mục đích:** Hiển thị bản đồ tuyến đường với các điểm dừng

**Luồng:**
1. Load thông tin tuyến và stops từ API
2. Khởi tạo bản đồ Leaflet
3. Vẽ đường đi giữa các điểm dừng (sử dụng Routing Machine)
4. Hiển thị marker cho từng điểm dừng
5. Click marker → Hiển thị popup với thông tin điểm dừng

### 10.2. TripMapModal
**Mục đích:** Hiển thị bản đồ chuyến đi với vị trí xe real-time

**Luồng:**
1. Load thông tin chuyến đi và tuyến đường
2. Khởi tạo bản đồ Leaflet
3. Vẽ đường đi dự kiến
4. Nếu chuyến đi đang diễn ra:
   - Lấy vị trí xe từ API real-time
   - Hiển thị marker vị trí xe
   - Cập nhật vị trí định kỳ (polling)

### 10.3. VehicleMapModal
**Mục đích:** Hiển thị vị trí xe và camera feed

**Luồng:**
1. Load vị trí xe từ API (sử dụng `deviceId` hoặc `vehicleId`)
2. Khởi tạo bản đồ Leaflet
3. Hiển thị marker vị trí xe
4. Load camera feed (nếu có)
5. Hiển thị video stream trong component `VehicleCamera`

---

## 🔌 11. MQTT Integration

### 11.1. Kết Nối MQTT
**Hook:** `useMqtt`

**Luồng:**
1. Kết nối đến MQTT broker
2. Subscribe topic: `esp32/status`
3. Publish topic: `esp32/write`
4. Lắng nghe messages và xử lý

### 11.2. Quét Thẻ RFID
**Sử dụng trong:** Driver Manager

**Luồng:**
1. Click "Quét thẻ" → Gửi `driverId` qua MQTT topic `esp32/write`
2. ESP32 nhận lệnh → Yêu cầu chạm thẻ
3. ESP32 gửi kết quả qua topic `esp32/status`:
   - "Chạm thẻ" → Hiển thị thông báo chờ
   - "Ghi dữ liệu thành công" → Thành công
   - "Ghi dữ liệu thất bại" → Thất bại

---

## 📱 12. Layout & Navigation

### 12.1. HomeLayout
**Component:** Layout chính cho các trang sau khi đăng nhập

**Cấu trúc:**
- **Sidebar**: Menu điều hướng
- **Header**: Header với thông tin user
- **Outlet**: Nội dung trang hiện tại

**Luồng:**
1. Khởi tạo xử lý FCM messages (foreground + service worker)
2. Render Sidebar và Header
3. Render nội dung trang qua `<Outlet />`

### 12.2. Sidebar
**Menu:**
- Trang chủ
- Quản lý (dropdown):
  - Quản lý người dùng (chỉ ADMIN)
  - Quản lý tài xế (chỉ ADMIN)
  - Quản lý đường đi
  - Quản lý chuyến đi
  - Quản lý xe (chỉ ADMIN)
- Thông báo (chỉ ADMIN)
- Cập nhật phần mềm

**Luồng:**
1. Click menu item → Navigate đến route tương ứng
2. Đóng sidebar (mobile)

---

## 🔄 13. Data Flow Tổng Quan

### 13.1. Authentication Flow
```
User → Login Form → API /auth/login → AuthContext → localStorage → ProtectedRoute
```

### 13.2. Data Fetching Flow
```
Component → Custom Hook (useXXX) → API Call → Update State → Re-render
```

### 13.3. Notification Flow
```
FCM Server → Firebase SDK → onMessage/Service Worker → localStorage → Notification Page
```

### 13.4. MQTT Flow
```
Component → useMqtt Hook → MQTT Client → ESP32 → MQTT Message → Component Update
```

---

## 📊 14. API Endpoints Sử Dụng

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `PATCH /api/v1/accounts/{accountId}/token` - Cập nhật FCM token

### Accounts
- `GET /api/v1/accounts` - Lấy danh sách tài khoản
- `POST /api/v1/accounts` - Tạo tài khoản
- `PATCH /api/v1/accounts/{accountId}` - Cập nhật tài khoản
- `DELETE /api/v1/accounts/{accountId}` - Xóa tài khoản

### Drivers
- `GET /api/v1/drivers` - Lấy danh sách tài xế
- `POST /api/v1/drivers` - Tạo tài xế
- `PATCH /api/v1/drivers/{driverId}` - Cập nhật tài xế
- `DELETE /api/v1/drivers/{driverId}` - Xóa tài xế

### Routes
- `GET /api/v1/routes` - Lấy danh sách tuyến
- `POST /api/v1/routes` - Tạo tuyến
- `GET /api/v1/routes/{routeId}` - Lấy chi tiết tuyến
- `GET /api/v1/routes/{routeId}/stops` - Lấy điểm dừng

### Stops
- `POST /api/v1/stops` - Tạo điểm dừng

### Trips
- `GET /api/v1/trips` - Lấy danh sách chuyến đi
- `POST /api/v1/trips` - Tạo chuyến đi
- `GET /api/v1/trips/{tripId}` - Lấy chi tiết chuyến đi

### Assignments
- `POST /api/v1/assignments` - Gán tài xế cho chuyến đi

### Vehicles
- `GET /api/v1/vehicles` - Lấy danh sách xe
- `POST /api/v1/vehicles` - Tạo xe
- `GET /api/v1/vehicles/{vehicleId}/location` - Lấy vị trí xe

### Verify
- `POST /api/v1/verify/confirm-update-vehicle/{decision}` - Xác nhận cập nhật xe

### Firmware
- `POST /api/v1/firmware` - Upload firmware

### Statistics
- `GET /api/v1/statistics/users-by-month` - Thống kê người dùng
- `GET /api/v1/statistics/trips-by-month` - Thống kê chuyến đi
- `GET /api/v1/statistics/violations-by-month` - Thống kê vi phạm

---

## 🎯 15. Tóm Tắt Luồng Chính

1. **Khởi động ứng dụng** → Đăng ký FCM token
2. **Đăng nhập** → Lưu token → Truy cập trang chủ
3. **Quản lý dữ liệu** → CRUD operations qua API
4. **Nhận thông báo** → Lưu vào localStorage → Hiển thị
5. **Xử lý thông báo** → Phản hồi Yes/No hoặc Xem chi tiết
6. **Theo dõi xe** → Xem vị trí real-time và camera
7. **Quản lý chuyến đi** → Tạo → Gán tài xế → Theo dõi

---

## 📝 Ghi Chú

- Tất cả API calls đều sử dụng Bearer token từ `AuthContext`
- Thông báo được lưu tối đa 100 items trong `localStorage`
- MQTT được sử dụng để giao tiếp với thiết bị ESP32
- Bản đồ sử dụng Leaflet và React Leaflet
- Firebase Cloud Messaging cho push notifications

