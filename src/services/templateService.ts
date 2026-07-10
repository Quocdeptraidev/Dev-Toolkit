import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

/**
 * Interface định nghĩa dịch vụ quản lý và phân giải Templates.
 */
export interface ITemplateService {
    /**
     * Xác định đường dẫn file template cần biên dịch.
     * Ưu tiên custom template trong workspace của người dùng, nếu không có sẽ dùng mặc định.
     * 
     * @param style Loại template ('spring' hoặc 'react')
     * @param templateName Tên file template (ví dụ: entity.hbs)
     * @param workspacePath Đường dẫn workspace hiện tại
     */
    getTemplatePath(style: 'spring' | 'react', templateName: string, workspacePath?: string): string;

    /**
     * Khởi tạo và copy các template mặc định vào workspace của người dùng để họ tùy chỉnh.
     * 
     * @param style Chọn khởi tạo template cho 'spring', 'react' hay 'all'
     * @param workspacePath Đường dẫn workspace hiện tại
     */
    initializeWorkspaceTemplates(style: 'spring' | 'react' | 'all', workspacePath: string): Promise<void>;
}

/**
 * Triển khai dịch vụ quản lý Template.
 */
export class TemplateService implements ITemplateService {
    
    constructor(private extensionPath: string) {}

    /**
     * Phân giải đường dẫn template, hỗ trợ override bằng custom template trong workspace.
     */
    public getTemplatePath(style: 'spring' | 'react', templateName: string, workspacePath?: string): string {
        if (workspacePath) {
            // Đường dẫn custom template trong dự án khách hàng
            const customPath = path.join(workspacePath, '.dev-toolkit', 'templates', style, templateName);
            if (fs.existsSync(customPath)) {
                Logger.info(`Sử dụng Custom Template tìm thấy tại: ${customPath}`);
                return customPath;
            }
        }

        // Đường dẫn template mặc định đi kèm extension
        const defaultPath = path.join(this.extensionPath, 'src', 'templates', style, templateName);
        Logger.info(`Sử dụng Default Template tại: ${defaultPath}`);
        return defaultPath;
    }

    /**
     * Copy toàn bộ template mặc định từ extension sang thư mục `.dev-toolkit/templates/` trong workspace.
     */
    public async initializeWorkspaceTemplates(style: 'spring' | 'react' | 'all', workspacePath: string): Promise<void> {
        try {
            Logger.info(`Bắt đầu khởi tạo templates trong workspace: ${workspacePath} với cấu hình style: ${style}`);
            
            const springTemplates = ['entity.hbs', 'repository.hbs', 'service.hbs', 'serviceImpl.hbs', 'controller.hbs', 'dto.hbs', 'mapper.hbs'];
            const reactTemplates = ['page.hbs', 'table.hbs', 'form.hbs', 'hook.hbs'];

            const initSpring = style === 'spring' || style === 'all';
            const initReact = style === 'react' || style === 'all';

            if (initSpring) {
                const targetSpringDir = path.join(workspacePath, '.dev-toolkit', 'templates', 'spring');
                const srcSpringDir = path.join(this.extensionPath, 'src', 'templates', 'spring');
                
                if (!fs.existsSync(targetSpringDir)) {
                    fs.mkdirSync(targetSpringDir, { recursive: true });
                }

                for (const file of springTemplates) {
                    const srcFile = path.join(srcSpringDir, file);
                    const destFile = path.join(targetSpringDir, file);
                    
                    if (fs.existsSync(srcFile)) {
                        fs.copyFileSync(srcFile, destFile);
                    }
                }
                Logger.info('Khởi tạo thành công templates Spring Boot mẫu.');
            }

            if (initReact) {
                const targetReactDir = path.join(workspacePath, '.dev-toolkit', 'templates', 'react');
                const srcReactDir = path.join(this.extensionPath, 'src', 'templates', 'react');

                if (!fs.existsSync(targetReactDir)) {
                    fs.mkdirSync(targetReactDir, { recursive: true });
                }

                for (const file of reactTemplates) {
                    const srcFile = path.join(srcReactDir, file);
                    const destFile = path.join(targetReactDir, file);
                    
                    if (fs.existsSync(srcFile)) {
                        fs.copyFileSync(srcFile, destFile);
                    }
                }
                Logger.info('Khởi tạo thành công templates React mẫu.');
            }

            Logger.info('Hoàn tất khởi tạo templates trong dự án.');
        } catch (error) {
            Logger.error('Lỗi khi sao chép templates sang workspace', error);
            throw new Error('Không thể khởi tạo templates trong workspace. Chi tiết lỗi xem tại Log Output.');
        }
    }
}
