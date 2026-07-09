import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Logger } from '../utils/logger';
import { toCamelCase, toSnakeCase, toPascalCase } from '../utils/stringUtils';

/**
 * Đăng ký tất cả các lệnh tiện ích (Utility Commands) cho Extension
 * 
 * @param context Context của Extension từ VS Code
 */
export function registerUtilityCommands(context: vscode.ExtensionContext): void {
	
	// 1. Command: Sinh mã ngẫu nhiên UUID
	const generateUUIDDisposable = vscode.commands.registerCommand('dev-toolkit.utility.generateUUID', () => {
		try {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Không tìm thấy tài liệu đang hoạt động.');
				return;
			}

			const uuid = crypto.randomUUID();

			editor.edit(editBuilder => {
				// Thay thế vùng chọn (selection) hiện tại bằng UUID,
				// nếu không bôi đen (selection rỗng) nó sẽ chèn tại vị trí con trỏ.
				editBuilder.replace(editor.selection, uuid);
			}).then(success => {
				if (success) {
					Logger.info(`Sinh mã UUID thành công: ${uuid}`);
				} else {
					Logger.error('Lỗi khi chèn UUID vào editor.');
				}
			});
		} catch (error) {
			Logger.error('Lỗi trong quá trình sinh UUID', error);
			vscode.window.showErrorMessage('Có lỗi xảy ra khi sinh UUID.');
		}
	});

	// Helper function xử lý chuyển đổi chữ chung cho các case
	const convertSelection = (converter: (text: string) => string, caseName: string) => {
		try {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Không tìm thấy tài liệu đang hoạt động.');
				return;
			}

			const selection = editor.selection;
			const text = editor.document.getText(selection);

			if (!text) {
				vscode.window.showWarningMessage('Vui lòng bôi đen đoạn chữ cần chuyển đổi.');
				return;
			}

			const convertedText = converter(text);
			editor.edit(editBuilder => {
				editBuilder.replace(selection, convertedText);
			}).then(success => {
				if (success) {
					Logger.info(`Chuyển đổi sang ${caseName} thành công: "${text}" -> "${convertedText}"`);
				} else {
					Logger.error(`Lỗi khi thay thế text cho ${caseName}.`);
				}
			});
		} catch (error) {
			Logger.error(`Lỗi khi chuyển đổi text sang ${caseName}`, error);
			vscode.window.showErrorMessage(`Có lỗi xảy ra khi chuyển đổi sang ${caseName}.`);
		}
	};

	// 2. Command: Convert to camelCase
	const toCamelCaseDisposable = vscode.commands.registerCommand('dev-toolkit.utility.toCamelCase', () => {
		convertSelection(toCamelCase, 'camelCase');
	});

	// 3. Command: Convert to snake_case
	const toSnakeCaseDisposable = vscode.commands.registerCommand('dev-toolkit.utility.toSnakeCase', () => {
		convertSelection(toSnakeCase, 'snake_case');
	});

	// 4. Command: Convert to PascalCase
	const toPascalCaseDisposable = vscode.commands.registerCommand('dev-toolkit.utility.toPascalCase', () => {
		convertSelection(toPascalCase, 'PascalCase');
	});

	// Đăng ký các command vào context subscriptions
	context.subscriptions.push(
		generateUUIDDisposable,
		toCamelCaseDisposable,
		toSnakeCaseDisposable,
		toPascalCaseDisposable
	);
}
