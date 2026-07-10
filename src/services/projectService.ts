import { IProjectInfo } from '../types/project';
import { ProjectAnalyzer } from '../analyzers/projectAnalyzer';
import { Logger } from '../utils/logger';

/**
 * Interface định nghĩa dịch vụ chẩn đoán dự án (Project Service).
 */
export interface IProjectService {
    /**
     * Phân tích và lấy thông tin chẩn đoán dự án tại workspace hiện tại.
     * 
     * @param workspacePath Đường dẫn gốc tuyệt đối của workspace
     */
    getProjectDiagnostics(workspacePath: string): Promise<IProjectInfo>;
}

/**
 * Triển khai dịch vụ phân tích chẩn đoán dự án.
 */
export class ProjectService implements IProjectService {
    private analyzer: ProjectAnalyzer;

    constructor() {
        this.analyzer = new ProjectAnalyzer();
    }

    /**
     * Phân tích và trả về thông tin chẩn đoán dự án tại workspace.
     */
    public async getProjectDiagnostics(workspacePath: string): Promise<IProjectInfo> {
        try {
            Logger.info(`ProjectService tiếp nhận yêu cầu chẩn đoán dự án tại: ${workspacePath}`);
            return await this.analyzer.analyze(workspacePath);
        } catch (error) {
            Logger.error(`Lỗi trong ProjectService khi chẩn đoán dự án tại: ${workspacePath}`, error);
            throw error;
        }
    }
}
