# Dev Toolkit

**Dev Toolkit** là một VS Code Extension được thiết kế để trở thành một "Developer Assistant" đắc lực dành cho các lập trình viên Fullstack, đặc biệt tối ưu hóa cho **React** và **Spring Boot**. 

Dự án này sinh ra nhằm tự động hóa các tác vụ lặp đi lặp lại (boilerplate code) và hỗ trợ quản lý dự án thông minh nhờ tích hợp AI.

## 🚀 Các Tính Năng Chính (Theo Kế Hoạch)

- **Boilerplate Generator:** Tạo nhanh Controller, Service, Repository (Spring Boot) và Page, Form, Table, Hook (React) chỉ với vài cú click chuột.
- **Smart Project Analyzer:** Tự động nhận diện cấu trúc, framework và các thư viện đang sử dụng trong dự án để sinh code đồng bộ convention.
- **Custom Templates:** Hỗ trợ viết template mở rộng bằng Handlebars.
- **Git Toolkit:** Tự động sinh commit message, tạo changelog, review diff code.
- **AI Assistant:** Hỗ trợ giải thích code, tìm lỗi (bug detection), viết Unit Test, refactor và review bảo mật/hiệu năng.

## 🛠️ Cấu Trúc Dự Án

```text
src/
├── commands/     # Các lệnh điều hướng và đăng ký command của extension
├── generators/   # Các logic sinh mã nguồn
├── templates/    # Nơi lưu trữ template (Handlebars)
├── providers/    # Interface & Implementations cho AI Model (OpenAI, Gemini...)
├── services/     # Các dịch vụ xử lý logic nghiệp vụ
├── parsers/      # Trích xuất và phân tích cú pháp mã nguồn
├── analyzers/    # Phân tích cấu trúc thư mục và dự án
├── utils/        # Các hàm tiện ích dùng chung
└── extension.ts  # Entry point của Extension
```

## 💻 Hướng Dẫn Phát Triển Nhanh (Quick Start)

### Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (phiên bản v16 trở lên)
- [VS Code](https://code.visualstudio.com/)

### Cài Đặt Dự Án
1. Clone repository về máy.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

### Chạy và Debug Extension
1. Mở dự án trong VS Code.
2. Nhấn phím `F5` để mở một cửa sổ VS Code mới (Extension Development Host) đã được load extension **Dev Toolkit**.
3. Mở Command Palette (`Ctrl+Shift+P` hoặc `Cmd+Shift+P` trên macOS) và gõ lệnh:
   ```text
   Dev Toolkit: Hello World
   ```
4. Bạn sẽ thấy một thông báo "Hello World from Dev Toolkit!" xuất hiện ở góc dưới bên phải màn hình.

---

*Phát triển bởi lập trình viên, dành cho lập trình viên.*
