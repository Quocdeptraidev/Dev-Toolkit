/**
 * Định nghĩa cấu trúc của một trường dữ liệu (Field) trong Entity
 */
export interface IField {
    name: string;       // Tên trường (ví dụ: id, productName)
    type: string;       // Kiểu dữ liệu (ví dụ: String, Integer, boolean)
    isId?: boolean;     // Có phải khóa chính không (mặc định: false)
    required?: boolean; // Bắt buộc nhập không (mặc định: false)
}

/**
 * Cấu hình tổng thể để sinh code CRUD
 */
export interface ICrudConfig {
    moduleName: string;      // Tên module/thực thể (PascalCase, ví dụ: Product)
    fields: IField[];        // Danh sách các trường dữ liệu
    targetPath: string;      // Thư mục đích để ghi code được sinh ra
    packageName?: string;    // Java package name (nếu sinh code Spring Boot, ví dụ: com.example.product)
    style?: 'spring' | 'react'; // Loại project muốn sinh
}
