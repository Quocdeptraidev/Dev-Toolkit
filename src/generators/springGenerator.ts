import * as path from 'path';
import { BaseGenerator } from './baseGenerator';
import { ICrudConfig } from '../types/crud';
import { Logger } from '../utils/logger';
import { TemplateService } from '../services/templateService';

/**
 * Generator sinh boilerplate CRUD cho dự án Spring Boot.
 */
export class SpringGenerator extends BaseGenerator {
    private templateService: TemplateService;

    constructor(private extensionPath: string) {
        super();
        this.templateService = new TemplateService(extensionPath);
    }

    /**
     * Sinh toàn bộ mã nguồn CRUD cho Spring Boot
     * 
     * @param config Cấu hình CRUD từ người dùng
     */
    public async generate(config: ICrudConfig): Promise<void> {
        try {
            if (!config.packageName) {
                throw new Error('Package name là bắt buộc đối với Spring Boot CRUD Generator.');
            }

            Logger.info(`Bắt đầu sinh code Spring Boot CRUD cho module: ${config.moduleName}`);

            // 1. Phân tích các trường dữ liệu
            const fieldsToRender = [...config.fields];
            let idField = fieldsToRender.find(f => f.isId);
            
            // Nếu không khai báo khóa chính, mặc định sinh trường id: Long làm khóa chính
            if (!idField) {
                idField = { name: 'id', type: 'Long', isId: true };
                fieldsToRender.unshift(idField);
            }

            const idType = idField.type;
            const idName = idField.name;

            // 2. Thiết lập đường dẫn thư mục nguồn
            const packageFolder = config.packageName.replace(/\./g, '/');
            const javaBase = path.join(config.targetPath, packageFolder);

            // 3. Chuẩn bị dữ liệu render cho Handlebars
            const renderData = {
                packageName: config.packageName,
                moduleName: config.moduleName,
                fields: fieldsToRender,
                idType: idType,
                idName: idName
            };

            // 4. Biên dịch và sinh các tệp tin
            const filesToGenerate = [
                {
                    template: 'entity.hbs',
                    output: path.join(javaBase, 'entity', `${config.moduleName}.java`)
                },
                {
                    template: 'repository.hbs',
                    output: path.join(javaBase, 'repository', `${config.moduleName}Repository.java`)
                },
                {
                    template: 'service.hbs',
                    output: path.join(javaBase, 'service', `${config.moduleName}Service.java`)
                },
                {
                    template: 'serviceImpl.hbs',
                    output: path.join(javaBase, 'service', 'impl', `${config.moduleName}ServiceImpl.java`)
                },
                {
                    template: 'controller.hbs',
                    output: path.join(javaBase, 'controller', `${config.moduleName}Controller.java`)
                },
                {
                    template: 'dto.hbs',
                    output: path.join(javaBase, 'dto', `${config.moduleName}Dto.java`)
                },
                {
                    template: 'mapper.hbs',
                    output: path.join(javaBase, 'mapper', `${config.moduleName}Mapper.java`)
                }
            ];

            for (const file of filesToGenerate) {
                const templatePath = this.templateService.getTemplatePath('spring', file.template, config.workspacePath);
                const fileContent = this.compileTemplate(templatePath, renderData);
                this.writeOutputFile(file.output, fileContent);
            }

            Logger.info(`Hoàn thành sinh code Spring Boot CRUD cho module: ${config.moduleName}`);
        } catch (error) {
            Logger.error(`Lỗi khi sinh code Spring Boot cho module: ${config.moduleName}`, error);
            throw error;
        }
    }
}
