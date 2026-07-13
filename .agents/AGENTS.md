# Project Rules: Sell Theme WP

Quy tắc phát triển dành cho dự án bán và quản lý WordPress theme (React 19 + TS + Ant Design 5 + Redux Toolkit).

## 1. Công nghệ & Thư viện (Tech Stack Rules)
- **React & DOM**: Luôn sử dụng **React 19**. Tận dụng tính năng tự động hoisting thẻ metadata (`<title>`, `<meta>`) có sẵn của React 19 thay vì dùng thêm thư viện ngoài như `react-helmet`.
- **UI Framework**: Sử dụng **Ant Design 5 (antd)** làm thư viện UI chính. Tuyệt đối **không** cài đặt hoặc sử dụng Material UI (MUI).
- **Quản lý trạng thái (State)**: Sử dụng **Redux Toolkit** làm store quản lý state toàn cục. Dùng **RTK Query** cho các tác vụ gọi API và lưu cache.
- **Routing**: Dùng **React Router v7** cho việc phân trang và định tuyến.

## 2. Thiết kế & Giao diện (Aesthetics & Styling Rules)
- **Design Tokens**: Ưu tiên cấu hình màu sắc, border radius và kiểu dáng thông qua `ConfigProvider` của Ant Design tại file `src/App.tsx`.
- **CSS**: Hạn chế viết CSS thuần tùy tiện. Chỉ viết CSS cho các hiệu ứng đặc biệt hoặc biến CSS toàn cục trong `src/index.css`.
- **Phông chữ**: Font mặc định của dự án là **Be Vietnam Pro** (được nhúng từ Google Fonts). Đảm bảo mọi thành phần giao diện đều kế thừa font này.
- **Aesthetic**: Giao diện cần thiết kế theo phong cách hiện đại, cao cấp (sử dụng hiệu ứng bo góc mượt mà, đổ bóng nhẹ, glassmorphism ở các bảng quản trị).

## 3. TypeScript & Quy chuẩn Code (Coding Standards)
- **Strict Typing**: Tuyệt đối không sử dụng kiểu dữ liệu `any`. Phải khai báo `interface` rõ ràng cho mọi API response và Redux state.
- **Components Modularity**: Không viết các file trang quá lớn (monolithic). Mọi phần giao diện nhỏ hơn (như thẻ theme card, các form nhập liệu, bảng biểu phức tạp) phải được tách nhỏ thành các React components riêng biệt trong thư mục `src/components/` hoặc thư mục con tương ứng, đảm bảo tính tái sử dụng cao và dễ viết test.
- **Thư mục**: Tuân thủ cấu trúc thư mục chuẩn:
  - `src/components/`: Component dùng chung.
  - `src/pages/`: Các trang chính.
  - `src/store/`: Cấu hình Redux store, slices, và API endpoints.
  - `src/hooks/`: Custom React hooks.

## 4. Ngôn ngữ & Việt hóa (Localization Rules)
- **Ngôn ngữ hiển thị**: Tất cả giao diện người dùng (labels, buttons, placeholders, notifications, messages, tooltips...) phải được viết bằng **Tiếng Việt** chuẩn xác, chuyên nghiệp.
- **Định dạng tiền tệ & thời gian**:
  - Đối với giá sản phẩm: Hiển thị giá rõ ràng, các nhãn hành động phải dùng tiếng Việt thân thiện (ví dụ: "Thêm Vào Giỏ", "Kích Hoạt Ngay").
  - Định dạng ngày tháng: Ưu tiên hiển thị theo định dạng Việt Nam `DD/MM/YYYY` ở các bảng dữ liệu quản trị.

## 5. Chú thích Code (Code Commenting Rules)
- **Comment chi tiết, sư phạm**: Khi viết hoặc chỉnh sửa mã nguồn, luôn viết chú thích (comments) giải thích chi tiết, cụ thể bằng Tiếng Việt. Giải thích rõ ràng mục đích, luồng dữ liệu và ý nghĩa của các khối logic phức tạp để các lập trình viên mới (fresher) đọc cũng có thể dễ dàng tiếp thu và học tập.

## 6. Quy tắc viết WordPress Plugins cho Headless WP (Headless WP Plugins Rules)
- **Quản lý dữ liệu & API**: Sử dụng WordPress làm Backend quản lý nội dung (ví dụ: Custom Post Type `lx_theme`) và cấp phát dữ liệu qua các Endpoint REST API tùy biến dưới Namespace riêng (ví dụ: `lx/v1`).
- **Bảo mật REST API (App-level Token)**: Mọi endpoint REST API cấp phát dữ liệu hoặc file tải về phải được bảo vệ bằng cơ chế xác thực Token dùng chung (App-level API Token). 
  - Token được Client React gửi qua Header `X-LX-API-Token` hoặc Query Parameter `api_token` trên URL.
  - Sử dụng tham số `permission_callback` trong `register_rest_route` để gọi hàm validate token tập trung, chặn các request không hợp lệ ngay từ vòng ngoài (trả về lỗi `403 Forbidden`).
- **Bảo mật File tải về (Stream Downloads)**: Tuyệt đối không để lộ hoặc redirect trực tiếp tới đường dẫn thật của file cài đặt (`.zip`) trên máy chủ. Endpoint tải file phải kiểm tra API Token hợp lệ, sau đó tiến hành đọc stream và đẩy file nhị phân trực tiếp cho trình duyệt tải xuống (ẩn giấu link download thật).
- **Tích hợp ACF Pro 6.2 (Advanced Custom Fields)**: Hệ thống sử dụng ACF Pro 6.2 để quản lý Custom Fields.
  - Khuyến khích sử dụng hàm đăng ký trường của ACF như `acf_add_local_field_group()` trực tiếp trong PHP để tự động tạo và hiển thị form nhập liệu cho Custom Post Type thay vì dựng form HTML Meta Box thủ công.
  - Sử dụng hàm `get_field('tên_trường', $post_id)` của ACF để lấy dữ liệu một cách ngắn gọn, tối ưu và an toàn tại các endpoint REST API.
- **UX & Trải nghiệm quản trị WordPress**:
  - Giao diện Admin Settings của plugin phải thiết kế chuyên nghiệp, sạch sẽ, chỉ giữ lại các trường cấu hình thực sự cần thiết và hỗ trợ các nút sinh mã (Generate), sao chép (Copy) tự động bằng jQuery.
  - Thêm liên kết hành động "Cài đặt" nổi bật ngay bên dưới tên Plugin tại trang danh sách Plugins để Admin dễ dàng truy cập cấu hình nhanh.
  - Tích hợp WordPress Media Uploader (`wp.media`) cho các trường upload file cài đặt hoặc hình ảnh để cải thiện trải nghiệm nhập liệu của quản trị viên.
  - Tất cả các nhãn (labels), mô tả hướng dẫn, thông báo và nút hành động trong phần cài đặt plugin của WordPress phải sử dụng **Tiếng Việt** chuẩn xác và chuyên nghiệp.

