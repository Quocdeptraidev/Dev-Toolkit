/**
 * Định nghĩa cấu trúc thông tin chẩn đoán dự án (Project Diagnostics Info)
 */
export interface IProjectInfo {
    /**
     * Loại framework/nền tảng của dự án ('spring' | 'react' | 'unknown')
     */
    type: 'spring' | 'react' | 'unknown';

    /**
     * Xác định dự án có sử dụng TypeScript không
     */
    isTypeScript: boolean;

    /**
     * Danh sách các thư viện bổ trợ/phụ thuộc được phát hiện trong dự án
     */
    libraries: {
        // Spring Boot Libraries
        lombok?: boolean;
        mapstruct?: boolean;
        jpa?: boolean;

        // React Libraries
        tailwindcss?: boolean;
        axios?: boolean;
        reactHookForm?: boolean;
    };

    /**
     * Cấu trúc tổ chức thư mục của dự án ('layered' | 'modular' | 'unknown')
     */
    folderStructure?: 'layered' | 'modular' | 'unknown';
}
