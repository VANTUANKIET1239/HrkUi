# Hướng dẫn Xây dựng Giao diện Sảnh Chính (Home/Lobby Component) trong Angular

## 1. Mục tiêu & Vị trí Thư mục
Tôi cần tạo giao diện và logic nền tảng cho trang sảnh chính (Home/Lobby) của game dựa trên thiết kế trong `ảnh 1.jpg`.
- **Thư mục làm việc:** Tất cả source code (HTML, SCSS, TS) sẽ được tạo/cập nhật trực tiếp trong thư mục `home` đã có sẵn.
- **Hình thức dữ liệu:** Hiện tại, toàn bộ thông tin người chơi, tài nguyên và danh sách tính năng sẽ sử dụng **seed/mock data** trực tiếp trong Component TS để chuẩn bị cho việc kết nối API backend sau này.

---

## 2. Phân tích Bố cục UI (Dựa trên `ảnh 1.jpg`)

Giao diện sảnh chính cần được chia thành 5 phân vùng chính bằng cách sử dụng `position: absolute` bao quanh một khung nền chiến thành cổ (Background):

### A. Cụm Thông tin Nhân vật (Top-Left UI)
- **Avatar Người chơi:** Khung viền lớn, hiển thị Avatar, Cấp độ (ví dụ: `120`), thanh EXP.
- **Thông tin bên cạnh:** Tên người chơi (`Runy997_8T6y`), Cấp VIP (`VIP 10`), Tổng Lực chiến (`C.Lực 4493`).
- **Nút tương tác phụ:** Nút "Nạp" ngay dưới avatar và biểu tượng "Thành tựu" hiển thị danh hiệu hiện tại.

### B. Cụm Tài nguyên & Tiền tệ (Top-Right UI)
- Hiển thị 3 loại tài nguyên chính nằm ngang góc trên bên phải, mỗi loại gồm Icon + Số lượng + Nút dấu cộng `[+]` để mua thêm:
  1. **Thể lực (Bánh mì):** Ví dụ `4104/200`.
  2. **Tiền vàng (Xu):** Ví dụ `59 Vạn`.
  3. **Kim cương (KNB):** Ví dụ `9973 Vạn`.

### C. Khu vực Sự kiện & Phúc lợi (Dưới Cụm Tài nguyên)
- Một chuỗi các biểu tượng (Icon tròn) nằm ngang có chấm đỏ thông báo (Notification Badge): *Nạp Đầu, Chiêu Mộ, Sự Kiện, Phúc Lợi, Chiêu Tài, Báo Danh, Trở Về*.
- Góc phải có một nút chức năng đóng/mở rộng `[+] THÊM`.

### D. Khu vực Đội hình Trung tâm (Main Showcase)
- **Nền (Background):** Sử dụng hình ảnh thành trì cổ kính dưới ánh trăng tròn (tạm thời dùng màu nền tối kết hợp gradient hoặc ảnh placeholder phù hợp phong cách).
- **Hiển thị nhân vật:** Dàn hàng ngang từ 3 đến 5 nhân vật trong đội hình chính hiện tại.
- **Thông tin trên đầu mỗi nhân vật:** Hiển thị Tên nhân vật + Cấp độ (Ví dụ: `Lv1 Bàng Đức`, `Lv1 Cao Thuận`, `Lv1 Chúc Dung`...).
- Có hiệu ứng đổ bóng dưới chân nhân vật để tạo chiều sâu không gian.

### E. Thanh Menu Tính năng Chính (Bottom UI Navigation)
Thanh công cụ dưới cùng được chia làm 2 cụm rõ rệt bằng các icon vuông/tròn giả cổ:
- **Cụm bên trái (Tính năng quản lý):** *Võ Tướng, Đội Ngũ, Nữ Thần, Thần Binh, Hành Trang, Quân Đoàn, Thương Tiệm, Nội Chính*.
- **Cụm bên phải (Tính năng phó bản & Khiêu chiến):** *Hộ Tống, Xuất Chinh, Chiến Dịch*.
- **Nút Tính năng Trọng tâm (Góc dưới cùng bên phải):** Nút **"Chính Tuyến"** hoặc **"Vượt Ải"** được thiết kế to hẳn lên, có hiệu ứng vòng tròn phát sáng bao quanh để thu hút người chơi click vào (kèm một nút phụ nhỏ "Đấu Trường" ngay phía trên).

---

## 3. Yêu cầu Triển khai Code trong Thư mục `dcs-game/src/app/features/home`

### Step 1: Định nghĩa Mock Data (`game-home.component.ts`)
Tạo các interface và đối tượng dữ liệu giả lập rõ ràng:
- `playerInfo`: Gồm name, level, vip, power, stamina, gold, diamond.
- `mainTeam`: Mảng danh sách các nhân vật đang showcase (name, level, avatarUrl).
- `features`: Danh sách các nút tính năng (gồm tên, icon class/path, và trạng thái `hasNotification: boolean` để bật chấm đỏ).

### Step 2: Cấu trúc Layout (`game-home.component.html`)
- Sử dụng các thẻ ngữ nghĩa hoặc hệ thống Class rõ ràng: `.lobby-container`, `.top-bar`, `.player-profile`, `.currency-group`, `.showcase-team`, `.bottom-navigation`.
- Sử dụng `ngFor` để render danh sách nút tính năng và danh sách nhân vật từ mock data.

### Step 3: Tạo Style (`game-home.component.scss`)
- Thiết kế layout dạng `fixed` hoặc `absolute` dựa trên khung chuẩn tỉ lệ 16:9 để giao diện không bị vỡ khi co giãn màn hình.
- Tái tạo các hiệu ứng CSS: Chấm đỏ thông báo nhấp nháy (`animation: pulse`), viền sáng bao quanh nút "Chính Tuyến", và hiệu ứng hover nhẹ cho các nút bấm.

Hãy tiến hành sinh mã nguồn (HTML, SCSS, TS) hoàn chỉnh cho trang sảnh chính này dựa trên các chỉ dẫn trên.