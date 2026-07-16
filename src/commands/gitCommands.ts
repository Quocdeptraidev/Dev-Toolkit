import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GitService } from '../services/gitService';
import { Logger } from '../utils/logger';

/**
 * Đăng ký các command liên quan đến Git Toolkit (Phase 7).
 * 
 * @param context Context của Extension từ VS Code
 */
export function registerGitCommands(context: vscode.ExtensionContext): void {
    const gitService = new GitService();

    // Helper: Lấy workspace path hiện tại đang active
    const getWorkspacePath = (): string | undefined => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }
        
        // Mặc định lấy workspace folder đầu tiên, 
        // hoặc nếu có editor đang mở thì lấy workspace folder chứa file đó.
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
            if (folder) {
                return folder.uri.fsPath;
            }
        }
        return workspaceFolders[0].uri.fsPath;
    };

    // 1. Lệnh: Sinh Commit Message từ Git Diff
    const generateCommitMsgDisposable = vscode.commands.registerCommand('dev-toolkit.git.generateCommitMessage', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi sử dụng tính năng này.');
            return;
        }

        try {
            let commitMessage = '';
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Đang phân tích thay đổi và sinh Commit Message...',
                cancellable: false
            }, async () => {
                commitMessage = await gitService.generateCommitMessage(workspacePath);
            });

            if (!commitMessage) {
                throw new Error('Không nhận được commit message nào từ AI.');
            }

            // Cố gắng tự động điền vào khung Git Input của VS Code (nếu có)
            let autoFilled = false;
            try {
                const gitExtension = vscode.extensions.getExtension<any>('vscode.git');
                if (gitExtension) {
                    const activated = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
                    const gitApi = activated.getAPI(1);
                    
                    if (gitApi && gitApi.repositories.length > 0) {
                        // Tìm repo tương ứng với workspacePath
                        const repo = gitApi.repositories.find((r: any) => {
                            const repoPath = path.normalize(r.rootUri.fsPath).toLowerCase();
                            const wsPath = path.normalize(workspacePath).toLowerCase();
                            return wsPath.startsWith(repoPath) || repoPath.startsWith(wsPath);
                        }) || gitApi.repositories[0];

                        if (repo) {
                            repo.inputBox.value = commitMessage;
                            autoFilled = true;
                            vscode.window.showInformationMessage('Đã tự động điền Commit Message vào khung Git Source Control!');
                        }
                    }
                }
            } catch (gitErr) {
                Logger.error('Lỗi khi tương tác với VS Code Git Extension API', gitErr);
            }

            // Nếu không tự điền được (hoặc người dùng không bật Git tab), hiện InputBox cho họ xem/sửa/copy
            if (!autoFilled) {
                const editedMsg = await vscode.window.showInputBox({
                    title: 'Commit Message đề xuất từ AI',
                    prompt: 'Bạn có thể chỉnh sửa lại trước khi copy/sử dụng',
                    value: commitMessage,
                    ignoreFocusOut: true
                });

                if (editedMsg) {
                    await vscode.env.clipboard.writeText(editedMsg);
                    vscode.window.showInformationMessage('Đã copy Commit Message vào Clipboard!');
                }
            }

        } catch (error: any) {
            Logger.error('Lỗi khi sinh Commit Message', error);
            vscode.window.showErrorMessage(`Sinh Commit Message thất bại: ${error.message || error}`);
        }
    });

    // 2. Lệnh: Sinh CHANGELOG từ lịch sử commit
    const generateChangelogDisposable = vscode.commands.registerCommand('dev-toolkit.git.generateChangelog', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi sử dụng tính năng này.');
            return;
        }

        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Đang phân tích lịch sử commit và sinh CHANGELOG.md...',
                cancellable: false
            }, async () => {
                await gitService.generateChangelog(workspacePath);
            });

            vscode.window.showInformationMessage('Đã cập nhật/tạo file CHANGELOG.md thành công!', 'Mở file').then(async (selection) => {
                if (selection === 'Mở file') {
                    const changelogPath = path.join(workspacePath, 'CHANGELOG.md');
                    if (fs.existsSync(changelogPath)) {
                        const doc = await vscode.workspace.openTextDocument(changelogPath);
                        await vscode.window.showTextDocument(doc);
                    }
                }
            });

        } catch (error: any) {
            Logger.error('Lỗi khi sinh CHANGELOG', error);
            vscode.window.showErrorMessage(`Sinh CHANGELOG thất bại: ${error.message || error}`);
        }
    });

    // 3. Lệnh: Sinh Release Notes từ lịch sử commit gần đây
    const generateReleaseNotesDisposable = vscode.commands.registerCommand('dev-toolkit.git.generateReleaseNotes', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi sử dụng tính năng này.');
            return;
        }

        try {
            let releaseNotes = '';
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Đang phân tích lịch sử commits và sinh Release Notes...',
                cancellable: false
            }, async () => {
                releaseNotes = await gitService.generateReleaseNotes(workspacePath);
            });

            if (!releaseNotes) {
                throw new Error('Không nhận được nội dung Release Notes từ AI.');
            }

            // Mở tài liệu markdown mới trong VS Code để hiển thị
            const doc = await vscode.workspace.openTextDocument({
                content: releaseNotes,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('Đã tạo bản nháp Release Notes thành công!');

        } catch (error: any) {
            Logger.error('Lỗi khi sinh Release Notes', error);
            vscode.window.showErrorMessage(`Sinh Release Notes thất bại: ${error.message || error}`);
        }
    });

    // 4. Lệnh: Tạo branch mới chuẩn hóa
    const createBranchDisposable = vscode.commands.registerCommand('dev-toolkit.git.createBranch', async () => {
        const workspacePath = getWorkspacePath();
        if (!workspacePath) {
            vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi sử dụng tính năng này.');
            return;
        }

        try {
            // Bước 1: Chọn loại Branch
            const branchTypes = [
                { label: 'feature', description: 'Phát triển tính năng mới' },
                { label: 'bugfix', description: 'Sửa lỗi thông thường' },
                { label: 'hotfix', description: 'Sửa lỗi khẩn cấp trên production' },
                { label: 'refactor', description: 'Cấu trúc lại, tối ưu hóa code' },
                { label: 'docs', description: 'Viết, cập nhật tài liệu' },
                { label: 'chore', description: 'Các công việc phụ trợ, cấu hình dự án' }
            ];

            const selectedType = await vscode.window.showQuickPick(branchTypes, {
                placeHolder: 'Chọn loại Branch bạn muốn tạo'
            });

            if (!selectedType) {
                Logger.info('Người dùng đã hủy chọn loại branch.');
                return;
            }

            // Bước 2: Nhập mô tả branch
            const description = await vscode.window.showInputBox({
                prompt: 'Nhập mô tả ngắn gọn cho branch (ví dụ: "add database connection")',
                placeHolder: 'Mô tả branch bằng tiếng Anh hoặc tiếng Việt không dấu',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Mô tả branch không được phép để trống.';
                    }
                    return null;
                }
            });

            if (!description) {
                Logger.info('Người dùng đã hủy nhập mô tả branch.');
                return;
            }

            // Bước 3: Đề xuất tên branch chuẩn hóa
            const proposedBranchName = gitService.suggestBranchName(selectedType.label, description);

            // Bước 4: Hỏi xác nhận tạo branch
            const choices = ['Có, tạo và checkout sang branch mới', 'Chỉ tạo branch mới', 'Hủy'];
            const userChoice = await vscode.window.showQuickPick(choices, {
                placeHolder: `Tên branch đề xuất: "${proposedBranchName}". Bạn muốn thực hiện hành động nào?`
            });

            if (!userChoice || userChoice === 'Hủy') {
                Logger.info('Người dùng đã hủy quá trình tạo branch.');
                return;
            }

            if (userChoice === 'Có, tạo và checkout sang branch mới') {
                await gitService.executeGitCommand(workspacePath, ['checkout', '-b', proposedBranchName]);
                vscode.window.showInformationMessage(`Đã tạo và chuyển sang branch mới: "${proposedBranchName}"!`);
            } else if (userChoice === 'Chỉ tạo branch mới') {
                await gitService.executeGitCommand(workspacePath, ['branch', proposedBranchName]);
                vscode.window.showInformationMessage(`Đã tạo thành công branch mới: "${proposedBranchName}" (không checkout)!`);
            }

        } catch (error: any) {
            Logger.error('Lỗi khi tạo branch mới', error);
            vscode.window.showErrorMessage(`Tạo branch mới thất bại: ${error.message || error}`);
        }
    });

    // Thêm các disposable vào extension subscriptions
    context.subscriptions.push(
        generateCommitMsgDisposable,
        generateChangelogDisposable,
        generateReleaseNotesDisposable,
        createBranchDisposable
    );
}
