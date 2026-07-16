import * as path from 'path';
import { BaseGenerator } from './baseGenerator';
import { ICrudConfig } from '../types/crud';
import { Logger } from '../utils/logger';
import { TemplateService } from '../services/templateService';
import { IProjectInfo } from '../types/project';
import { toCamelCase, toPascalCase, toSnakeCase } from '../utils/stringUtils';

/**
 * Generator sinh boilerplate CRUD cho dự án React TypeScript.
 */
export class ReactGenerator extends BaseGenerator {
    private templateService: TemplateService;

    constructor(extensionPath: string) {
        super();
        this.templateService = new TemplateService(extensionPath);
    }

    /**
     * Định dạng tên file theo naming convention phát hiện được
     */
    private formatFileName(name: string, type: 'page' | 'table' | 'form' | 'hook', naming: 'pascal' | 'kebab' | 'camel'): string {
        const kebabName = toSnakeCase(name).replace(/_/g, '-');
        if (naming === 'kebab') {
            if (type === 'page') return `${kebabName}-page`;
            if (type === 'table') return `${kebabName}-table`;
            if (type === 'form') return `${kebabName}-form`;
            if (type === 'hook') return `use-${kebabName}`;
        }
        if (naming === 'camel') {
            if (type === 'page') return `${toCamelCase(name)}Page`;
            if (type === 'table') return `${toCamelCase(name)}Table`;
            if (type === 'form') return `${toCamelCase(name)}Form`;
            if (type === 'hook') return `use${toPascalCase(name)}`;
        }
        // Mặc định PascalCase
        if (type === 'page') return `${toPascalCase(name)}Page`;
        if (type === 'table') return `${toPascalCase(name)}Table`;
        if (type === 'form') return `${toPascalCase(name)}Form`;
        return `use${toPascalCase(name)}`;
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
     * @param projectInfo Thông tin chẩn đoán dự án phục vụ sinh code thông minh
     */
    public async generate(config: ICrudConfig, projectInfo?: IProjectInfo): Promise<void> {
        try {
            Logger.info(`Bắt đầu sinh code React CRUD cho module: ${config.moduleName}`);

            // 1. Phân tích các thư viện đi kèm của dự án
            const useTailwind = projectInfo ? !!projectInfo.libraries.tailwindcss : true;
            const naming = projectInfo?.namingConvention || 'pascal';
            const importStyle = projectInfo?.importStyle || 'relative';

            // 2. Phân tích trường dữ liệu và ánh xạ kiểu TypeScript
            const mappedFields = config.fields.map(f => ({
                ...f,
                type: this.mapGenericToTsType(f.type)
            }));

            // Tìm trường khóa chính
            const idField = config.fields.find(f => f.isId) || { name: 'id', type: 'Long', isId: true };
            const idName = idField.name;

            // 3. Tính toán import paths dựa trên absolute / relative import của dự án
            let importPrefix = '.';
            if (importStyle === 'absolute' && config.targetPath.includes('src')) {
                const srcIndex = config.targetPath.indexOf('src');
                const afterSrc = config.targetPath.substring(srcIndex + 3).replace(/\\/g, '/');
                const normalizedPath = afterSrc.startsWith('/') ? afterSrc.substring(1) : afterSrc;
                importPrefix = `@/${normalizedPath}`;
            }

            // Định dạng tên tệp tin đầu ra theo convention dự án
            const pageFileName = this.formatFileName(config.moduleName, 'page', naming);
            const tableFileName = this.formatFileName(config.moduleName, 'table', naming);
            const formFileName = this.formatFileName(config.moduleName, 'form', naming);
            const hookFileName = this.formatFileName(config.moduleName, 'hook', naming);

            // 4. Thiết lập đường dẫn output
            const targetDir = config.targetPath;

            // 5. Chuẩn bị dữ liệu render cho Handlebars
            const renderData = {
                moduleName: config.moduleName,
                fields: mappedFields,
                idName: idName,
                useTailwind: useTailwind,
                importStyle: importStyle,
                // Đường dẫn import các component/hook con vào file Page component
                tableImportPath: importStyle === 'absolute' ? `${importPrefix}/components/${tableFileName}` : `./components/${tableFileName}`,
                formImportPath: importStyle === 'absolute' ? `${importPrefix}/components/${formFileName}` : `./components/${formFileName}`,
                hookImportPath: importStyle === 'absolute' ? `${importPrefix}/hooks/${hookFileName}` : `./hooks/${hookFileName}`,
                // Tên Component và tên custom hook chuẩn PascalCase/camelCase để gọi trong JSX
                tableComponentName: toPascalCase(config.moduleName) + 'Table',
                formComponentName: toPascalCase(config.moduleName) + 'Form',
                hookName: 'use' + toPascalCase(config.moduleName)
            };

            // 6. Biên dịch và ghi các tệp tin React
            const filesToGenerate = [
                {
                    template: 'page.hbs',
                    output: path.join(targetDir, `${pageFileName}.tsx`)
                },
                {
                    template: 'table.hbs',
                    output: path.join(targetDir, 'components', `${tableFileName}.tsx`)
                },
                {
                    template: 'form.hbs',
                    output: path.join(targetDir, 'components', `${formFileName}.tsx`)
                },
                {
                    template: 'hook.hbs',
                    output: path.join(targetDir, 'hooks', `${hookFileName}.ts`)
                }
            ];

            for (const file of filesToGenerate) {
                const templatePath = this.templateService.getTemplatePath('react', file.template, config.workspacePath);
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
