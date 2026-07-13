---
name: senior-workflow
description: Quy trình làm việc 4 bước chuẩn Senior (Phân tích, Triển khai module, Xử lý ngoại lệ, Xác minh & Bàn giao). Kích hoạt khi cần lập kế hoạch và thực hiện các tác vụ code trong dự án.
---

# Quy trình phát triển chuẩn Senior cho Agent

Khi thực hiện bất kỳ nhiệm vụ lập trình, nâng cấp hoặc sửa đổi mã nguồn nào trong dự án, Agent phải tuân thủ nghiêm ngặt quy trình làm việc 4 bước sau đây để đảm bảo chất lượng kỹ thuật cao nhất:

## Bước 1: Phân tích & Nghiên cứu (Analyze & Research)
*   **Định vị vị trí sửa đổi**: Sử dụng các công cụ tìm kiếm (`grep_search`, `view_file`) để xác định chính xác những tệp tin và đoạn code cần chỉnh sửa.
*   **Phân tích ảnh hưởng**: Đánh giá các mối quan hệ phụ thuộc (dependencies) trong dự án. Việc thay đổi ở module này có làm hỏng tính năng của module khác không?
*   **Đề xuất giải pháp**: Với những thay đổi phức tạp, Agent phải phác thảo sơ đồ/kế hoạch triển khai và hỏi ý kiến phản hồi của người dùng trước khi tiến hành code.

## Bước 2: Triển khai chuẩn hóa & Module hóa (Implementation & Modularity)
*   **Clean Code & Strict Typing**: Tuyệt đối không sử dụng kiểu dữ liệu `any` trong TypeScript. Định nghĩa `interface`/`type` rõ ràng.
*   **Module hóa**: Chia nhỏ các thành phần giao diện phức tạp thành các component tái sử dụng được, lưu trữ đúng cấu trúc thư mục (`src/components/`, `src/pages/`, `src/store/`).
*   **Chú thích chi tiết (Sư phạm)**: Viết comment bằng Tiếng Việt giải thích rõ ràng luồng dữ liệu, mục đích của các hàm và khối logic phức tạp để các lập trình viên mới (fresher) đọc cũng có thể tiếp thu và học tập.

## Bước 3: Tối ưu hóa & Xử lý ngoại lệ (Exception Handling & Optimization)
*   **Xử lý ngoại lệ chủ động**: Bao bọc toàn bộ các thao tác không chắc chắn (gọi API, truy cập localStorage/sessionStorage, xử lý JSON.parse) trong khối `try...catch` để ngăn chặn lỗi làm sập giao diện (uncaught runtime errors).
*   **Antd Components**: Đảm bảo các thuộc tính sử dụng trên các component của Ant Design 5 là mới nhất và không dùng các API đã bị deprecate.

## Bước 4: Xác minh & Bàn giao (Verify & Walkthrough)
*   **Xác minh chất lượng**: Chạy kiểm tra cú pháp, build dự án (`npm run build`) hoặc chạy test nếu có trước khi hoàn tất công việc.
*   **Báo cáo kết quả (Walkthrough)**: Trình bày chi tiết các file đã sửa đổi kèm theo liên kết markdown có thể click được (ví dụ: `[filename](file:///...)`) và tóm tắt logic thay đổi một cách súc tích cho người dùng dễ dàng nghiệm thu.
