import { ICrudConfig } from '../types/crud';
import { SpringGenerator } from '../generators/springGenerator';
import { ReactGenerator } from '../generators/reactGenerator';
import { Logger } from '../utils/logger';

/**
 * Interface cho CRUD Service điều phối sinh mã nguồn.
 */
export interface ICrudService {
    /**
     * Thực hiện điều phối và sinh mã CRUD
     * 
     * @param config Cấu hình CRUD từ UI
     */
    generateCrud(config: ICrudConfig): Promise<void>;
}

/**
 * Lớp điều phối chính cho việc sinh mã nguồn CRUD.
 */
export class CrudService implements ICrudService {
    
    constructor(private extensionPath: string) {}

    /**
     * Thực hiện sinh mã nguồn CRUD dựa trên cấu hình (React hoặc Spring Boot)
     */
    public async generateCrud(config: ICrudConfig): Promise<void> {
        try {
            Logger.info(`CrudService bắt đầu tiếp nhận yêu cầu sinh CRUD style [${config.style}] cho module [${config.moduleName}]`);
            
            if (config.style === 'spring') {
                const generator = new SpringGenerator(this.extensionPath);
                await generator.generate(config);
            } else if (config.style === 'react') {
                const generator = new ReactGenerator(this.extensionPath);
                await generator.generate(config);
            } else {
                throw new Error(`Kiểu sinh code (style) '${config.style}' không được hỗ trợ.`);
            }

            Logger.info(`CrudService xử lý thành công yêu cầu sinh CRUD style [${config.style}]`);
        } catch (error) {
            Logger.error(`Lỗi xảy ra trong CrudService khi sinh code cho module: ${config.moduleName}`, error);
            throw error;
        }
    }
}
