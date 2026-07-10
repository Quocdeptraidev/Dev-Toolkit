import * as vscode from 'vscode';
import { CrudService } from '../services/crudService';
import { IField } from '../types/crud';
import { Logger } from '../utils/logger';

/**
 * Đăng ký command dev-toolkit.crud.generate với VS Code
 * 
 * @param context Context của Extension từ VS Code
 */
export function registerCrudCommands(context: vscode.ExtensionContext): void {
    const generateCrudDisposable = vscode.commands.registerCommand('dev-toolkit.crud.generate', async () => {
        try {
            // 1. QuickPick chọn Style (React hoặc Spring Boot)
            const styleSelection = await vscode.window.showQuickPick([
                { label: 'Spring Boot CRUD', value: 'spring', description: 'Sinh code JPA Entity, Repository, Service, Controller...' },
                { label: 'React CRUD', value: 'react', description: 'Sinh code React Page, components, custom Hook...' }
            ], {
                placeHolder: 'Chọn loại dự án bạn muốn sinh mã nguồn CRUD'
            });

            if (!styleSelection) {
                Logger.info('Người dùng đã hủy chọn kiểu sinh code.');
                return;
            }
            const style = styleSelection.value;

            // 2. Nhập tên Module (PascalCase)
            const moduleName = await vscode.window.showInputBox({
                prompt: 'Nhập tên Module / Thực thể (ví dụ: Product, Order) - Dạng PascalCase',
                placeHolder: 'Product',
                validateInput: (value) => {
                    if (!value || !/^[A-Z][a-zA-Z0-9]*$/.test(value)) {
                        return 'Tên module phải bắt đầu bằng chữ hoa và chỉ chứa ký tự chữ/số (PascalCase).';
                    }
                    return null;
                }
            });

            if (!moduleName) {
                Logger.info('Người dùng đã hủy nhập tên module.');
                return;
            }

            // 3. Chọn thư mục đích ghi code được sinh ra
            const workspaceFolders = vscode.workspace.workspaceFolders;
            const defaultUri = workspaceFolders && workspaceFolders.length > 0 ? workspaceFolders[0].uri : undefined;

            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                defaultUri: defaultUri,
                openLabel: 'Chọn thư mục đích sinh code'
            });

            if (!folderUri || folderUri.length === 0) {
                Logger.info('Người dùng đã hủy chọn thư mục đích.');
                return;
            }
            const targetPath = folderUri[0].fsPath;

            // Lấy thư mục workspace chứa targetPath
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(folderUri[0]);
            const workspacePath = workspaceFolder ? workspaceFolder.uri.fsPath : undefined;

            // 4. Nhập Java Package (nếu là Spring Boot)
            let packageName: string | undefined = undefined;
            if (style === 'spring') {
                packageName = await vscode.window.showInputBox({
                    prompt: 'Nhập Java Package Name (ví dụ: com.example.demo.product)',
                    placeHolder: 'com.example.demo.product',
                    value: `com.example.${moduleName.toLowerCase()}`,
                    validateInput: (value) => {
                        if (!value || !/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(value)) {
                            return 'Package name không hợp lệ (ví dụ: com.example.demo).';
                        }
                        return null;
                    }
                });

                if (!packageName) {
                    Logger.info('Người dùng đã hủy nhập Java package name.');
                    return;
                }
            }

            // 5. Nhập danh sách các trường (Fields)
            const defaultFieldsInput = style === 'spring'
                ? 'id:Long:id, name:String:required, status:String'
                : 'id:number:id, name:string:required, status:string';

            const fieldsInput = await vscode.window.showInputBox({
                prompt: "Nhập danh sách các trường theo định dạng 'name:type:option', phân tách bằng dấu phẩy.",
                placeHolder: defaultFieldsInput,
                value: defaultFieldsInput,
                ignoreFocusOut: true,
                validateInput: (value) => {
                    if (!value || value.trim() === '') {
                        return 'Danh sách trường không được để trống.';
                    }
                    const parts = value.split(',').map(p => p.trim());
                    for (const part of parts) {
                        const segments = part.split(':').map(s => s.trim());
                        if (segments.length < 2 || segments[0] === '' || segments[1] === '') {
                            return `Định nghĩa trường không hợp lệ: "${part}". Cần tối thiểu dạng 'name:type'.`;
                        }
                    }
                    return null;
                }
            });

            if (!fieldsInput) {
                Logger.info('Người dùng đã hủy nhập danh sách các trường.');
                return;
            }

            // 6. Phân tích cú pháp chuỗi fields nhập vào
            const fields: IField[] = [];
            const parts = fieldsInput.split(',').map(p => p.trim());
            for (const part of parts) {
                const segments = part.split(':').map(s => s.trim());
                const name = segments[0];
                const type = segments[1];
                const option = segments[2] ? segments[2].toLowerCase() : '';

                fields.push({
                    name,
                    type,
                    isId: option === 'id',
                    required: option === 'required'
                });
            }

            // 7. Gọi service chạy hiển thị progress bar
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Đang sinh code CRUD cho ${moduleName}...`,
                cancellable: false
            }, async () => {
                const crudService = new CrudService(context.extensionPath);
                await crudService.generateCrud({
                    moduleName,
                    fields,
                    targetPath,
                    packageName,
                    style: style as 'spring' | 'react',
                    workspacePath
                });
            });

            vscode.window.showInformationMessage(`Sinh code CRUD cho module ${moduleName} thành công!`);
        } catch (error: any) {
            Logger.error('Lỗi khi thực hiện command sinh CRUD', error);
            vscode.window.showErrorMessage(`Sinh code CRUD thất bại: ${error.message || error}`);
        }
    });

    context.subscriptions.push(generateCrudDisposable);
}
