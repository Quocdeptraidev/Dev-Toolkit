# Dev Toolkit - Master Plan

## 1. Tổng quan

### Tên dự án

**Dev Toolkit**

### Mục tiêu

Xây dựng một VS Code Extension giúp lập trình viên tự động hóa các công việc lặp đi lặp lại trong quá trình phát triển phần mềm.

Khác với các extension chỉ có một hoặc hai chức năng, Dev Toolkit hướng đến việc trở thành một "Developer Assistant" dành cho React, Spring Boot và các dự án Fullstack.

---

# 2. Vision

> Giảm thời gian viết boilerplate xuống còn vài giây.

Ví dụ thay vì mất 30 phút tạo một module mới, người dùng chỉ cần:

```
Right Click

↓

Generate Module

↓

Done
```

---

# 3. Mục tiêu dài hạn

Dev Toolkit sẽ phát triển theo 3 cấp độ.

## Phase 1

Developer Productivity

Tập trung vào:

- Generate code
- Refactor
- Convert code
- Utilities

## Phase 2

Project Intelligence

Extension bắt đầu hiểu project.

Ví dụ:

- React
- Spring Boot
- NextJS
- NestJS

Sau đó sinh code theo đúng convention.

## Phase 3

AI Assistant

Không chỉ generate.

Mà còn:

- Review
- Explain
- Refactor
- Detect Bug
- Generate Test
- Suggest Architecture

---

# 4. Đối tượng sử dụng

Primary

- Frontend Developer
- Backend Developer
- Fullstack Developer

Secondary

- Sinh viên
- Freelancer
- Startup

---

# 5. Tech Stack

## Core

- TypeScript
- NodeJS
- VSCode Extension API

## Template

- Handlebars

## Code Analysis

- ts-morph
- TypeScript Compiler API

## AI

- OpenAI
- Anthropic
- Gemini

(Thiết kế Provider Pattern để dễ thay đổi model)

## Utility

- Prettier
- ESLint

---

# 6. Kiến trúc

```
src/

commands/
    generate/
    convert/
    ai/
    git/
    project/

generators/

templates/

providers/

services/

parsers/

analyzers/

utils/

extension.ts
```

---

# 7. Kiến trúc hệ thống

```
VS Code

        │

Command Palette

        │

Extension

        │

──────────────────────────────

Command Layer

↓

Business Layer

↓

Generator Layer

↓

Template Engine

↓

Workspace API

↓

Filesystem
```

---

# 8. Roadmap

## Milestone 1

### Foundation

Thời gian

1 tuần

Mục tiêu

Khởi tạo project.

Hoàn thành

- Hello World
- Command
- InputBox
- QuickPick
- Output Channel
- Logging

Deliverable

Có thể publish bản đầu tiên.

---

## Milestone 2

### Utilities

Thời gian

1 tuần

Tính năng

JSON → TypeScript

JSON → Java DTO

Generate UUID

camelCase

snake_case

PascalCase

Sort Imports

Copy Relative Path

Copy Absolute Path

Format File

Deliverable

v0.2

---

## Milestone 3

### CRUD Generator

Thời gian

2 tuần

Spring Boot

Generate

- Controller
- Service
- ServiceImpl
- Repository
- Entity
- DTO
- Mapper

React

Generate

- Page
- Form
- Table
- Hook
- API
- Types

Deliverable

v0.3

---

## Milestone 4

### Template Engine

Thời gian

1 tuần

Xây dựng Template System.

```
Customer

↓

Template

↓

Render

↓

Output
```

Người dùng có thể tự tạo template riêng.

---

## Milestone 5

### Project Analyzer

Thời gian

2 tuần

Extension tự phát hiện project.

Ví dụ

```
Spring Boot

React

NextJS

NestJS

Vue

Angular
```

Đọc:

- package.json
- pom.xml
- build.gradle
- tsconfig
- folder structure

Sau đó xác định framework.

---

## Milestone 6

### Smart Generator

Đây là tính năng quan trọng nhất.

Ví dụ project đang dùng

- Lombok
- MapStruct
- Swagger
- Validation

Generator sẽ sinh đúng style đó.

Không dùng template cứng.

---

## Milestone 7

### Git Toolkit

Generate Commit

Review Diff

Generate CHANGELOG

Branch Naming

Release Note

---

## Milestone 8

### AI Assistant

Review Code

Explain

Generate Test

Refactor

Find Bug

Generate Documentation

---

## Milestone 9

### Sidebar

Tree View

History

Favorites

Templates

AI Chat

Recent Commands

---

## Milestone 10

### Marketplace

Publish

Telemetry (Optional)

Crash Report

Auto Update

Documentation

Website

---

# 9. Kiến trúc Module

```
Commands

↓

Service

↓

Analyzer

↓

Generator

↓

Template

↓

Output
```

---

# 10. Coding Convention

- SOLID
- Clean Architecture (ở mức phù hợp với extension)
- Dependency Injection
- Interface First
- Provider Pattern
- Factory Pattern
- Strategy Pattern
- Repository Pattern (nếu cần lưu cấu hình)

---

# 11. Feature Backlog

## Utilities

- JSON → TS
- JSON → Java
- JSON → C#
- UUID
- Base64
- Hash
- JWT Decode
- Date Formatter

---

## React

- Generate Page

- Generate Hook

- Generate API

- Generate Form

- Generate Table

- Generate Modal

- Generate Route

---

## Spring

- Generate CRUD

- Generate Entity

- Generate DTO

- Generate Mapper

- Generate Service

- Generate Controller

---

## Git

- Commit Generator

- Branch Generator

- Changelog

- Diff Review

---

## AI

- Explain

- Refactor

- Unit Test

- Integration Test

- Review

- Security Review

- Performance Review

---

## Project

- Detect Framework

- Detect Architecture

- Detect Naming Convention

- Detect Folder Convention

---

# 12. Phiên bản

## v0.1

Utilities

## v0.2

CRUD Generator

## v0.3

Project Analyzer

## v0.4

Smart Generator

## v0.5

Git Toolkit

## v1.0

AI Developer Assistant

---

# 13. Tiêu chí hoàn thành

## MVP

- Có thể cài đặt từ file `.vsix`.
- Có ít nhất 10 command hữu ích.
- Sinh code ổn định theo template.
- Có tài liệu hướng dẫn.

## v1.0

- Publish lên VS Code Marketplace.
- Hỗ trợ React và Spring Boot.
- Có Smart Generator.
- Có AI Review.
- Có hệ thống template mở rộng.

---

# 14. Định hướng tương lai

Sau khi Dev Toolkit ổn định, có thể mở rộng thành một nền tảng dành cho developer:

- Template Marketplace.
- Đồng bộ template qua GitHub.
- Chia sẻ template giữa các thành viên trong team.
- AI Agent đọc toàn bộ workspace để hỗ trợ phát triển tính năng.
- CLI đi kèm (`dev-toolkit-cli`) để dùng ngoài VS Code.
- Hỗ trợ nhiều IDE khác như Cursor hoặc Windsurf nếu nền tảng cho phép.

---

# 15. Nguyên tắc phát triển

1. Mỗi tính năng phải giải quyết một vấn đề thực tế.
2. Ưu tiên tốc độ và trải nghiệm người dùng.
3. Không tích hợp AI nếu chưa thực sự mang lại giá trị.
4. Mọi generator đều phải có khả năng tùy biến bằng template.
5. Luôn tự sử dụng extension trong các dự án hằng ngày trước khi phát hành.

**Mục tiêu cuối cùng không phải là tạo thêm một extension, mà là xây dựng một công cụ mà chính bản thân người phát triển cũng muốn sử dụng mỗi ngày.**
