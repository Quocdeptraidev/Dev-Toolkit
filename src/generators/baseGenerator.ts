import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ICrudConfig } from '../types/crud';
import { Logger } from '../utils/logger';
import { toCamelCase, toPascalCase, toSnakeCase } from '../utils/stringUtils';

/**
 * Lớp trừu tượng cơ sở cho các Generator trong hệ thống.
 * Cung cấp các hàm dùng chung để biên dịch template Handlebars và ghi file ra đĩa.
 */
export abstract class BaseGenerator {

    constructor() {
        this.registerHelpers();
    }

    /**
     * Đăng ký các custom helper cho Handlebars để sử dụng trong templates
     */
    private registerHelpers(): void {
        // Helper so sánh bằng
        Handlebars.registerHelper('eq', (a: any, b: any) => a === b);

        // Helpers chuyển đổi chữ
        Handlebars.registerHelper('camel', (str: string) => toCamelCase(str));
        Handlebars.registerHelper('pascal', (str: string) => toPascalCase(str));
        Handlebars.registerHelper('snake', (str: string) => toSnakeCase(str));
        Handlebars.registerHelper('capitalize', (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });

        // Helper sinh label hiển thị thân thiện từ tên trường camelCase
        Handlebars.registerHelper('label', (str: string) => {
            if (!str) return '';
            const result = str.replace(/([A-Z])/g, ' $1');
            return result.charAt(0).toUpperCase() + result.slice(1).trim();
        });
    }

    /**
     * Đọc tệp template Handlebars (.hbs) và sinh ra mã nguồn dạng Text
     * 
     * @param templatePath Đường dẫn tuyệt đối tới tệp template .hbs
     * @param data Đối tượng chứa dữ liệu để truyền vào template
     * @returns Chuỗi mã nguồn sau khi được biên dịch
     */
    protected compileTemplate(templatePath: string, data: any): string {
        try {
            const content = fs.readFileSync(templatePath, 'utf-8');
            const template = Handlebars.compile(content);
            return template(data);
        } catch (error) {
            Logger.error(`Lỗi khi biên dịch template tại đường dẫn: ${templatePath}`, error);
            throw error;
        }
    }

    /**
     * Tạo thư mục (nếu chưa có) và ghi file mã nguồn ra đĩa
     * 
     * @param outputPath Đường dẫn tuyệt đối tới tệp mã nguồn đầu ra
     * @param content Nội dung tệp mã nguồn cần ghi
     */
    protected writeOutputFile(outputPath: string, content: string): void {
        try {
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                // Tạo thư mục đệ quy nếu thư mục cha chưa tồn tại
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outputPath, content, 'utf-8');
            Logger.info(`Sinh file thành công: ${outputPath}`);
        } catch (error) {
            Logger.error(`Lỗi khi ghi file ra đường dẫn: ${outputPath}`, error);
            throw error;
        }
    }

    /**
     * Hàm trừu tượng yêu cầu các Generator con (như SpringGenerator, ReactGenerator)
     * bắt buộc phải tự cài đặt để xử lý logic sinh code riêng biệt.
     * 
     * @param config Cấu hình sinh mã CRUD
     */
    public abstract generate(config: ICrudConfig): Promise<void>;
}
