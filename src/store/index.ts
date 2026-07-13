// configureStore là hàm tiện ích cốt lõi của Redux Toolkit giúp thiết lập Store nhanh chóng, tự động tích hợp Redux DevTools
import { configureStore } from '@reduxjs/toolkit';
// setupListeners giúp tự động refetch (gọi lại API) khi ứng dụng được focus lại (người dùng quay lại tab trình duyệt) hoặc có kết nối mạng lại
import { setupListeners } from '@reduxjs/toolkit/query';

// Import API Slice (RTK Query) chuyên dùng để gọi API và quản lý cache dữ liệu từ server
import { themeApi } from './themeApi';
// Import UI Slice chuyên quản lý các state cục bộ của giao diện (Giỏ hàng, từ khóa tìm kiếm...)
import themeUIReducer from './themeSlice';

/**
 * Nơi khởi tạo Cửa hàng dữ liệu toàn cục (Redux Store)
 * Lưu trữ mọi trạng thái (state) quan trọng của ứng dụng.
 */
export const store = configureStore({
  // Tham số reducer là nơi khai báo các 'ngăn kéo' chứa dữ liệu
  reducer: {
    // Ngăn kéo API: Kết nối Reducer tự sinh của RTK Query vào Store.
    // Dùng computed property name (dấu ngoặc vuông) để lấy đúng tên do RTK Query định nghĩa
    [themeApi.reducerPath]: themeApi.reducer,
    
    // Ngăn kéo UI: Lưu trữ state cục bộ của ứng dụng (giỏ hàng, ô tìm kiếm)
    themeUI: themeUIReducer,
  },
  
  // Middleware là "người gác cổng" xử lý các action trước khi chúng chạy vào Reducer.
  // RTK Query yêu cầu bắt buộc phải thêm middleware của nó vào để kích hoạt các tính năng nâng cao (như caching, polling, invalidation...)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(themeApi.middleware),
});

// Kích hoạt tính năng tự động gọi lại API (refetchOnFocus/refetchOnReconnect) của RTK Query
setupListeners(store.dispatch);

/**
 * Xây dựng và xuất khẩu các Type (Kiểu dữ liệu) dành cho TypeScript
 * Để khi gọi useSelector hoặc useDispatch trong component, TS có thể gợi ý code (auto-complete) chính xác.
 */

// Lấy kiểu dữ liệu toàn bộ State của ứng dụng thông qua hàm getState() của store
export type RootState = ReturnType<typeof store.getState>;

// Lấy kiểu dữ liệu hàm dispatch của store để đảm bảo truyền đúng payload
export type AppDispatch = typeof store.dispatch;
