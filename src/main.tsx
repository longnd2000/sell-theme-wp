// Import thư viện cốt lõi của React
import React from 'react';
// Import thư viện dùng để gắn kết (render) React component vào cây DOM của trình duyệt
import ReactDOM from 'react-dom/client';

// Provider từ react-redux giúp toàn bộ ứng dụng có thể truy cập được dữ liệu từ Redux Store
import { Provider } from 'react-redux';
// BrowserRouter dùng để quản lý việc chuyển trang (routing) trên Frontend mà không cần reload
import { BrowserRouter } from 'react-router-dom';

// Import kho lưu trữ dữ liệu (Store) đã cấu hình của dự án
import { store } from './store';

// Component gốc chứa toàn bộ giao diện của ứng dụng
import App from './App';
// Import file CSS toàn cục chứa các biến CSS và class tiện ích dùng chung
import './index.css';
// Import Component "Biên giới lỗi" (ErrorBoundary) để bắt và xử lý lỗi không lường trước
import ErrorBoundary from './components/ErrorBoundary';

/**
 * Hàm ReactDOM.createRoot tìm thẻ HTML có id='root' trong file index.html
 * và "bơm" (render) toàn bộ ứng dụng React vào trong thẻ đó.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  // Tùy chọn: StrictMode là chế độ giúp phát hiện các vấn đề tiềm ẩn trong code React (chỉ chạy ở môi trường Dev)
  <React.StrictMode>
    {/* Bọc toàn bộ App bằng Provider, truyền vào `store` để các component con có thể dùng chung State */}
    <Provider store={store}>
      {/* Bọc App bằng ErrorBoundary để đảm bảo nếu có trang nào bị sập, nó sẽ chỉ hiện lỗi tại trang đó thay vì sập toàn bộ web */}
      <ErrorBoundary>
        {/* BrowserRouter kích hoạt tính năng định tuyến URL (Ví dụ: /cart, /checkout) */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
