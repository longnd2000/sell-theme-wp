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

