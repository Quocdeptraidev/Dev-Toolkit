# Dev Toolkit - Tiêu chuẩn Lập trình & Kiến trúc Codebase (Coding Standards & Architecture)

Tệp này định nghĩa các quy tắc thiết kế hệ thống, kiến trúc codebase, quy cách đặt tên và tiêu chuẩn viết mã nguồn áp dụng cho toàn bộ dự án **Dev Toolkit**. Mọi thành viên phát triển (bao gồm cả lập trình viên và AI Assistants) bắt buộc phải tuân thủ nghiêm ngặt các quy định này.

---

## 🏛️ 1. Kiến trúc Codebase (Architecture)

Dev Toolkit áp dụng mô hình phân lớp có trách nhiệm riêng biệt (Separation of Concerns) để đảm bảo hệ thống dễ mở rộng, bảo trì và viết Unit Test.

```
VS Code UI (Command Palette / Sidebar)
       │
       ▼
┌──────────────────────────────────────────────┐
│ 1. Command Layer (src/commands/)             │
│    - Tiếp nhận tương tác, thu thập input     │
└──────┬───────────────────────────────────────┘
       │ Gọi
       ▼
┌──────────────────────────────────────────────┐
│ 2. Service Layer (src/services/)             │
│    - Xử lý logic nghiệp vụ trung tâm        │
└──────┬───────────────────────────────────────┘
       │ Gọi
       ▼
┌──────────────────────────────────────────────┐
│ 3. Core Engine (src/generators/ & analyzers/)│
│    - Sinh mã (Generators) & Phân tích (AST)  │
└──────┬───────────────────────────────────────┘
       │ Sử dụng
       ▼
┌──────────────────────────────────────────────┐
│ 4. Infrastructure & Templates (src/utils/)   │
│    - Template engine, Logger, HTTP, File IO  │
└──────────────────────────────────────────────┘
```

### Chi tiết các lớp:
1. **Command Layer (`src/commands/`):** 
   - Chỉ đảm nhận nhiệm vụ đăng ký lệnh với VS Code, hiển thị UI (như `showInputBox`, `showQuickPick`) để lấy thông tin từ người dùng và gọi xuống lớp Service. 
   - Không chứa logic nghiệp vụ phức tạp.
2. **Service Layer (`src/services/`):**
   - Nơi điều phối chính. Lớp này nhận dữ liệu đầu vào đã được làm sạch từ Command, gọi Analyzer để phân tích dự án, gọi Generator để sinh mã, và gọi các Utilities để tương tác với hệ thống tệp.
3. **Generators & Analyzers (`src/generators/` & `src/analyzers/`):**
   - **Generators:** Chịu trách nhiệm render code từ các template.
   - **Analyzers:** Sử dụng TypeScript Compiler API hoặc `ts-morph` để đọc và phân tích cấu trúc code hiện tại (AST) của workspace khách hàng.
4. **Templates (`src/templates/`):**
   - Chứa các file template dạng Handlebars (`.hbs`). Tuyệt đối không viết cứng mã nguồn cần sinh (boilerplate) dưới dạng chuỗi string trong file TypeScript.
5. **Providers (`src/providers/`):**
   - Nơi định nghĩa các adapter kết nối tới AI (Gemini, OpenAI...) thông qua một Interface chung (`IAIProvider`) để dễ dàng hoán đổi.

---

## 🏷️ 2. Quy cách đặt tên (Naming Conventions)

* **Tên file:**
  * File TypeScript (`.ts`): Dạng `camelCase` (ví dụ: `templateEngine.ts`, `stringUtils.ts`).
  * File Template (`.hbs`): Dạng `kebab-case` (ví dụ: `spring-controller.hbs`).
* **Class & Interface:**
  * **Class:** Dạng `PascalCase` (ví dụ: `Logger`, `TemplateService`).
  * **Interface:** Dạng `PascalCase` và luôn bắt đầu bằng tiền tố `I` (ví dụ: `ICommand`, `IGenerator`, `IAIProvider`).
* **Biến và Hàm:** Dạng `camelCase` (ví dụ: `activeEditor`, `generateUUID()`).
* **Hằng số (Constants):** Dạng `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_TEMPLATE_PATH`).
* **Lệnh VS Code (Command ID):** Đăng ký trong `package.json` theo cấu trúc: `dev-toolkit.<group>.<action>` (ví dụ: `dev-toolkit.utility.generateUUID`, `dev-toolkit.ai.explain`).

---

## ⚙️ 3. Tiêu chuẩn viết code (Coding Guidelines)

### Nguyên tắc thiết kế (SOLID & Clean Code):
* **Single Responsibility Principle (SRP):** Mỗi file, class hoặc function chỉ làm đúng một việc duy nhất và làm thật tốt việc đó.
* **Interface-First Design:** Luôn định nghĩa Interface trước khi viết class cài đặt (Implementation class). Các lớp gọi nhau thông qua Interface để giảm sự phụ thuộc cứng (Decoupling).

### Kháng lỗi & Ghi log (Error Handling & Logging):
* Mọi thao tác I/O (đọc/ghi file, gọi API mạng, gọi AI Provider) bắt buộc phải bọc trong khối `try-catch`.
* Khi xảy ra lỗi:
  1. Ghi log chi tiết (bao gồm cả stack trace) vào Output Channel thông qua `Logger.error()`.
  2. Hiển thị thông báo lỗi thân thiện và ngắn gọn tới người dùng bằng `vscode.window.showErrorMessage()`.
  3. Không để chương trình bị crash âm thầm.

### Quản lý mã nguồn (Boilerplate Generation):
* Cấm tuyệt đối việc cộng chuỗi string thủ công để sinh file code lớn. Tất cả mã boilerplate phải được tách ra file `.hbs` trong thư mục `templates/` và render thông qua template engine.

---

## 🧪 4. Quy trình Kiểm thử & Tài liệu (Testing & Documentation)

* **Unit Test:**
  * Các module độc lập không phụ thuộc vào VS Code API (như `parsers/`, `utils/`, `analyzers/`) bắt buộc phải có Unit Test.
  * Sử dụng thư viện test chuẩn (Mocha + Chai).
* **Documentation:**
  * Mọi API public, class, interface hoặc hàm phức tạp đều phải có JSDoc giải thích chức năng, tham số đầu vào (`@param`) và giá trị trả về (`@returns`).
  * Giữ gìn sự sạch sẽ của mã nguồn, viết comment giải thích tại sao làm như vậy (nếu thuật toán phức tạp) chứ không viết lại những gì code đã thể hiện rõ ràng.
