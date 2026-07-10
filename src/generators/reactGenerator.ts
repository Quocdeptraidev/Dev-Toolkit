import * as path from 'path';
import { BaseGenerator } from './baseGenerator';
import { ICrudConfig } from '../types/crud';
import { Logger } from '../utils/logger';

/**
 * Generator sinh boilerplate CRUD cho dự án React TypeScript.
 */
export class ReactGenerator extends BaseGenerator {

    constructor(private extensionPath: string) {
        super();
    }

    /**
     * Ánh xạ kiểu dữ liệu Java/Generic sang kiểu TypeScript
     * 
     * @param genericType Kiểu dữ liệu gốc
     */
    private mapGenericToTsType(genericType: string): string {
        const typeLower = genericType.toLowerCase();
        if (typeLower === 'string' || typeLower === 'char') {
            return 'string';
        }
        if (
            typeLower === 'int' ||
            typeLower === 'integer' ||
            typeLower === 'long' ||
            typeLower === 'double' ||
            typeLower === 'float' ||
            typeLower === 'bigdecimal' ||
            typeLower === 'number'
        ) {
            return 'number';
        }
        if (typeLower === 'boolean' || typeLower === 'bool') {
            return 'boolean';
        }
        if (typeLower === 'date' || typeLower === 'localdate' || typeLower === 'localdatetime') {
            return 'string'; // Thường FE lưu date dạng ISO string
        }
        return 'any';
    }

    /**
     * Sinh toàn bộ mã nguồn CRUD cho React
     * 
     * @param config Cấu hình CRUD từ người dùng
     */
    public async generate(config: ICrudConfig): Promise<void> {
        try {
            Logger.info(`Bắt đầu sinh code React CRUD cho module: ${config.moduleName}`);

            // 1. Phân tích trường dữ liệu và ánh xạ kiểu TypeScript
            const mappedFields = config.fields.map(f => ({
                ...f,
                type: this.mapGenericToTsType(f.type)
            }));

            // Tìm trường khóa chính
            const idField = config.fields.find(f => f.isId) || { name: 'id', type: 'Long', isId: true };
            const idName = idField.name;

            // 2. Thiết lập đường dẫn template và output
            const templateDir = path.join(this.extensionPath, 'src', 'templates', 'react');
            
            // Cấu trúc thư mục module React đầu ra
            const targetDir = config.targetPath;

            // 3. Chuẩn bị dữ liệu render cho Handlebars
            const renderData = {
                moduleName: config.moduleName,
                fields: mappedFields,
                idName: idName
            };

            // 4. Biên dịch và ghi các tệp tin React
            const filesToGenerate = [
                {
                    template: 'page.hbs',
                    output: path.join(targetDir, `${config.moduleName}Page.tsx`)
                },
                {
                    template: 'table.hbs',
                    output: path.join(targetDir, 'components', `${config.moduleName}Table.tsx`)
                },
                {
                    template: 'form.hbs',
                    output: path.join(targetDir, 'components', `${config.moduleName}Form.tsx`)
                },
                {
                    template: 'hook.hbs',
                    output: path.join(targetDir, 'hooks', `use${config.moduleName}.ts`)
                }
            ];

            for (const file of filesToGenerate) {
                const templatePath = path.join(templateDir, file.template);
                const fileContent = this.compileTemplate(templatePath, renderData);
                this.writeOutputFile(file.output, fileContent);
            }

            Logger.info(`Hoàn thành sinh code React CRUD cho module: ${config.moduleName}`);
        } catch (error) {
            Logger.error(`Lỗi khi sinh code React cho module: ${config.moduleName}`, error);
            throw error;
        }
    }
}
