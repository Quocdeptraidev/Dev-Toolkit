# Dev Toolkit - Toàn bộ lộ trình phát triển (Project Roadmap & Checklist)

Tệp này ghi lại chi tiết các đầu việc trong toàn bộ quá trình phát triển **Dev Toolkit**. Bạn có thể dùng nó làm checklist để đánh dấu tiến độ thực tế khi hoàn thành từng phần.

---

## 📅 Tổng quan tiến độ

- [x] **Phase 1: Foundation (Nền móng)** - *Đã hoàn thành*
- [/] **Phase 2: Utilities (Tiện ích lập trình)** - *Đang thực hiện (Hoàn thành UUID & Case Converter)*
- [ ] **Phase 3: CRUD Generator (Bộ sinh code CRUD)**
- [ ] **Phase 4: Template Engine (Hệ thống Template)**
- [ ] **Phase 5: Project Analyzer (Bộ phân tích dự án)**
- [ ] **Phase 6: Smart Generator (Bộ sinh code thông minh)**
- [ ] **Phase 7: Git Toolkit (Tiện ích Git)**
- [ ] **Phase 8: AI Assistant (Trợ lý AI)**
- [ ] **Phase 9: Sidebar UI (Giao diện Sidebar)**
- [ ] **Phase 10: Marketplace & Publishing (Phát hành)**

---

## 📑 Chi tiết các Phase & Checklist

### 🏁 Phase 1: Foundation (Nền móng)
Thiết lập dự án, môi trường chạy thử và các cơ chế nền tảng.
- [x] Khởi tạo cấu hình dự án TypeScript (`package.json`, `tsconfig.json`)
- [x] Thiết lập cấu trúc thư mục nguồn (`src/commands/`, `src/generators/`, v.v.)
- [x] Tạo file entrypoint [extension.ts](file:///d:/Dev-Toolkit/src/extension.ts) và lệnh Hello World
- [x] Thiết lập cấu hình Debug (`.vscode/launch.json`, `.vscode/tasks.json`)
- [x] Chạy thử và xác minh biên dịch (compile) thành công
- [x] Xây dựng hệ thống Log tập trung (`src/utils/logger.ts`) ghi ra VS Code Output Channel

---

### 🛠️ Phase 2: Utilities (Tiện ích lập trình)
Các tính năng nhỏ, tiện ích chạy nhanh không phụ thuộc cấu trúc dự án.
- [ ] **Sinh mã ngẫu nhiên:**
  - [x] Sinh mã UUID v4 chèn trực tiếp tại con trỏ chuột
  - [x] Sinh chuỗi ký tự ngẫu nhiên (chữ, số, ký tự đặc biệt) theo độ dài yêu cầu
- [ ] **Bộ chuyển đổi định dạng chữ (Case Converter):**
  - [x] Chuyển đổi vùng chọn sang `camelCase`
  - [x] Chuyển đổi vùng chọn sang `snake_case`
  - [x] Chuyển đổi vùng chọn sang `PascalCase`
- [ ] **Chuyển đổi định dạng dữ liệu:**
  - [ ] Trình biên dịch JSON → Interface TypeScript
  - [ ] Trình biên dịch JSON → Java DTO class (hỗ trợ Lombok/Jackson)
- [ ] **Các tiện ích khác:**
  - [x] Mã hóa/Giải mã Base64 cho đoạn text được chọn
  - [x] Giải mã và hiển thị thông tin JWT Token (Header, Payload, Signature)

---

### 🧱 Phase 3: CRUD Generator (Bộ sinh code CRUD)
Sinh mã boilerplate cho các module CRUD của React và Spring Boot.
- [ ] **Spring Boot Generator:**
  - [ ] Sinh Entity Class (hỗ trợ JPA Annotations)
  - [ ] Sinh Repository Interface (Spring Data JPA)
  - [ ] Sinh Service Interface và ServiceImpl Class
  - [ ] Sinh Controller REST API với các endpoint cơ bản (GET, POST, PUT, DELETE)
  - [ ] Sinh DTO & Mapper class (hỗ trợ MapStruct nếu cần)
- [ ] **React Generator:**
  - [ ] Sinh cấu trúc Page chứa danh sách và form
  - [ ] Sinh Component Table hiển thị dữ liệu (hỗ trợ phân trang)
  - [ ] Sinh Component Form nhập liệu (hỗ trợ validation cơ bản)
  - [ ] Sinh Custom Hook gọi API (hỗ trợ Axios / Fetch)

---

### 📐 Phase 4: Template Engine (Hệ thống Template)
Tách rời logic sinh code ra khỏi mã nguồn extension bằng template engine.
- [ ] Tích hợp **Handlebars.js** làm bộ dựng template chính
- [ ] Thiết kế cơ chế quét thư mục template nội bộ của extension
- [ ] Hỗ trợ cấu hình thư mục template tùy biến của người dùng tại `.dev-toolkit/templates/` trong workspace
- [ ] Cho phép người dùng chỉnh sửa template trực tiếp và áp dụng ngay khi sinh code

---

### 🔍 Phase 5: Project Analyzer (Bộ phân tích dự án)
Extension tự động quét và phân tích dự án hiện tại để hiểu ngữ cảnh.
- [ ] Phân tích các file cấu hình (`package.json`, `pom.xml`, `build.gradle`, `tsconfig.json`) để xác định:
  - [ ] Framework đang sử dụng (React, Spring Boot, NextJS, NestJS, Vue...)
  - [ ] Các thư viện bổ trợ đang cài đặt (Lombok, MapStruct, TailwindCSS, Axios...)
- [ ] Nhận diện cấu trúc thư mục dự án (kiểu Clean Architecture, Hexagonal, Layered, hay Standard MVC)

---

### 🧠 Phase 6: Smart Generator (Bộ sinh code thông minh)
Sinh mã đồng bộ 100% với coding convention hiện có của dự án khách hàng.
- [ ] Tự động sinh code khớp với thư viện đang dùng (ví dụ: dự án dùng Lombok thì Entity/DTO sẽ tự động sinh `@Data` thay vì hàm Getter/Setter thủ công)
- [ ] Đồng bộ phong cách đặt tên (ví dụ: biến dùng camelCase hay snake_case, file dùng kebab-case hay camelCase)
- [ ] Đồng bộ style import (absolute path `@/components/...` hay relative path `../../components/...`)

---

### 🐙 Phase 7: Git Toolkit (Tiện ích Git)
Hỗ trợ quản lý phiên bản và quy trình làm việc Git.
- [ ] Tự động sinh Commit Message chuẩn Conventional Commits dựa trên Git Diff hiện tại
- [ ] Tự động sinh file `CHANGELOG.md` từ lịch sử commit
- [ ] Đọc Git Diff và tạo bản nháp Release Notes hoặc Release Changelog nhanh
- [ ] Đề xuất tên Branch mới theo chuẩn đặt tên (ví dụ: `feature/xxx`, `bugfix/xxx`)

---

### 🤖 Phase 8: AI Assistant (Trợ lý AI)
Tích hợp trí tuệ nhân tạo để tăng tốc phát triển phần mềm.
- [ ] Thiết kế **AI Provider Interface** (hỗ trợ cắm API Key của Gemini, OpenAI, Anthropic...)
- [ ] Tác vụ thông minh trên vùng chọn code:
  - [ ] **Explain Code:** Giải thích logic hoạt động của đoạn code phức tạp
  - [ ] **Refactor Code:** Đề xuất tối ưu hóa cấu trúc code, giảm bớt lồng nhau, tăng tính dễ đọc
  - [ ] **Generate Test:** Sinh Unit Test tự động cho hàm được chọn
  - [ ] **Find Bugs:** Phân tích và phát hiện các bug logic tiềm ẩn hoặc các vấn đề bảo mật (Security review)

---

### 🖥️ Phase 9: Sidebar UI (Giao diện Sidebar)
Tạo giao diện tương tác trực quan thay vì chỉ dùng Command Palette.
- [ ] Xây dựng **Sidebar Webview Panel** trong VS Code
- [ ] Tạo Tree View hiển thị danh sách các template đang có
- [ ] Giao diện quản lý phím tắt nhanh cho các Utilities thường dùng
- [ ] Tích hợp giao diện AI Chat trực tiếp trong Sidebar để trao đổi với Trợ lý AI

---

### 🚢 Phase 10: Marketplace & Publishing (Phát hành)
Đóng gói, tối ưu hóa và xuất bản extension đến cộng đồng.
- [ ] Viết tài liệu hướng dẫn sử dụng chi tiết (User Manual)
- [ ] Đóng gói extension thành file cài đặt offline `.vsix` bằng `vsce`
- [ ] Cấu hình CI/CD tự động build và release trên GitHub
- [ ] Đăng ký tài khoản Publisher và xuất bản lên VS Code Marketplace công khai
