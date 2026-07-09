# Dev Toolkit - Agent Guidelines

Tệp này định nghĩa các nguyên tắc phát triển mã nguồn dành riêng cho các AI Coding Assistant khi tham gia đóng góp mã nguồn cho dự án **Dev Toolkit**.

## 1. Nguyên Tắc Thiết Kế Hệ Thống (Coding Standards)

Mọi mã nguồn mới được tạo ra hoặc chỉnh sửa đều phải tuân thủ nghiêm ngặt các tiêu chuẩn sau:

*   **SOLID & Clean Code:** Giữ các class và function có trách nhiệm duy nhất (Single Responsibility Principle). Tách biệt rõ ràng phần xử lý Extension UI, Logic sinh mã (Generators) và Tương tác với AI (Providers).
*   **Dependency Injection & Interface-First:** Luôn thiết kế thông qua Interface trước khi cài đặt Class cụ thể. Ví dụ: các AI Provider phải implements interface `IAIProvider`.
*   **Không Hardcode Templates:** Tất cả mã boilerplate được sinh ra phải thông qua Template Engine (Handlebars). Tuyệt đối không cộng chuỗi string thủ công trong code TypeScript để tạo file.
*   **Kháng Lỗi (Error Handling):** Các thao tác với Hệ thống tệp (Filesystem) hoặc gọi API bên ngoài (AI Providers) bắt buộc phải bọc trong khối `try-catch`, ghi log chi tiết vào Output Channel của Extension và hiển thị thông báo thân thiện tới người dùng (`vscode.window.showErrorMessage`).

## 2. Quy Cách Đặt Tên (Naming Conventions)

*   **TypeScript Files:** Dạng `camelCase` (ví dụ: `templateEngine.ts`, `smartAnalyzer.ts`).
*   **Classes/Interfaces:** Dạng `PascalCase`. Interface bắt đầu bằng tiền tố `I` (ví dụ: `ICommand`, `IGenerator`).
*   **Commands:** Đăng ký command trong `package.json` theo định dạng `dev-toolkit.<group>.<action>` (ví dụ: `dev-toolkit.ai.explain`).

## 3. Quy Trình Refactor & Sửa Đổi
*   Trước khi tiến hành sửa đổi các file logic nghiệp vụ quan trọng trong các thư mục `services/`, `generators/` hay `providers/`, hãy đảm bảo đã phân tích AST hoặc cấu trúc hiện tại của dự án để không phá vỡ các chức năng cũ.
*   Viết Unit Test cho các module độc lập như `parsers/`, `analyzers/` và `utils/`.
