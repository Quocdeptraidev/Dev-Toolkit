import * as vscode from 'vscode';
import * as path from 'path';
import { TemplateService } from '../services/templateService';
import { Logger } from '../utils/logger';

/**
 * Đăng ký các command liên quan đến Templates (Phase 4)
 * 
 * @param context Context của Extension từ VS Code
 */
export function registerTemplateCommands(context: vscode.ExtensionContext): void {
    const initTemplatesDisposable = vscode.commands.registerCommand('dev-toolkit.template.init', async () => {
        try {
            // 1. Kiểm tra Workspace đang mở
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi khởi tạo custom templates.');
                return;
            }

            // Hỗ trợ chọn workspace nếu mở nhiều folder (Multi-root Workspace)
            let selectedWorkspacePath = workspaceFolders[0].uri.fsPath;
            if (workspaceFolders.length > 1) {
                const folderSelection = await vscode.window.showQuickPick(
                    workspaceFolders.map(folder => ({
                        label: folder.name,
                        description: folder.uri.fsPath,
                        folder: folder
                    })),
                    { placeHolder: 'Chọn thư mục dự án bạn muốn khởi tạo custom templates' }
                );
                
                if (!folderSelection) {
                    Logger.info('Người dùng đã hủy chọn thư mục dự án.');
                    return;
                }
                selectedWorkspacePath = folderSelection.description;
            }

            // 2. QuickPick chọn kiểu template muốn khởi tạo (Spring, React, All)
            const styleSelection = await vscode.window.showQuickPick([
                { label: 'Spring Boot Templates', value: 'spring', description: 'Sao chép các template Entity, Repository, Controller...' },
                { label: 'React Templates', value: 'react', description: 'Sao chép các template Page, Table, Form, Hook...' },
                { label: 'All Platforms (Spring Boot & React)', value: 'all', description: 'Sao chép toàn bộ templates của cả 2 nền tảng' }
            ], {
                placeHolder: 'Chọn các template nền tảng muốn copy vào dự án của bạn'
            });

            if (!styleSelection) {
                Logger.info('Người dùng đã hủy chọn nền tảng template.');
                return;
            }

            // 3. Khởi chạy hiển thị Progress bar
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Đang sao chép templates mẫu vào dự án...',
                cancellable: false
            }, async () => {
                const templateService = new TemplateService(context.extensionPath);
                await templateService.initializeWorkspaceTemplates(
                    styleSelection.value as 'spring' | 'react' | 'all',
                    selectedWorkspacePath
                );
            });

            // 4. Thông báo và cho phép người dùng mở thư mục template
            const templatesPath = path.join(selectedWorkspacePath, '.dev-toolkit', 'templates');
            vscode.window.showInformationMessage(
                `Đã tạo thư mục templates tùy chỉnh tại: .dev-toolkit/templates/`,
                'Mở thư mục Templates'
            ).then(async (action) => {
                if (action === 'Mở thư mục Templates') {
                    const templatesUri = vscode.Uri.file(templatesPath);
                    await vscode.commands.executeCommand('revealInExplorer', templatesUri);
                }
            });

        } catch (error: any) {
            Logger.error('Lỗi khi thực hiện command khởi tạo templates', error);
            vscode.window.showErrorMessage(`Khởi tạo custom templates thất bại: ${error.message || error}`);
        }
    });

    context.subscriptions.push(initTemplatesDisposable);
}
