import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Logger } from '../utils/logger';
import { toCamelCase, toSnakeCase, toPascalCase, generateRandomString, base64Decode, base64Encode } from '../utils/stringUtils';


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

	// 5. Command: Sinh chuỗi ngẫu nhiên
	const generateRandomStringDisposable = vscode.commands.registerCommand('dev-toolkit.utility.generateRandomString', async () => {
		try {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Không tìm thấy tài liệu đang hoạt động.');
				return;
			}

			// Hiển thị ô nhập liệu (InputBox) yêu cầu người dùng nhập độ dài
			const lengthInput = await vscode.window.showInputBox({
				prompt: 'Nhập độ dài chuỗi ngẫu nhiên cần sinh',
				placeHolder: 'Ví dụ: 16',
				value: '16', // Giá trị mặc định
				validateInput: (value) => {
					const num = Number(value);
					if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
						return 'Vui lòng nhập một số nguyên dương hợp lệ.';
					}
					return null; // Không có lỗi
				}
			});

			// Nếu người dùng bấm Esc hoặc tắt ô nhập liệu (lengthInput sẽ là undefined)
			if (lengthInput === undefined) {
				return;
			}

			const length = parseInt(lengthInput, 10);
			const randomStr = generateRandomString(length);

			editor.edit(editBuilder => {
				editBuilder.replace(editor.selection, randomStr);
			}).then(success => {
				if (success) {
					Logger.info(`Sinh chuỗi ngẫu nhiên thành công (độ dài ${length}): ${randomStr}`);
				} else {
					Logger.error('Lỗi khi chèn chuỗi ngẫu nhiên vào editor.');
				}
			});
		} catch (error) {
			Logger.error('Lỗi trong quá trình sinh chuỗi ngẫu nhiên', error);
			vscode.window.showErrorMessage('Có lỗi xảy ra khi sinh chuỗi ngẫu nhiên.');
		}
	});

	// 6. Command: Base64 Encode
	const base64EncodeDisposable = vscode.commands.registerCommand('dev-toolkit.utility.base64Encode', () => {
		convertSelection(base64Encode, 'Base64 Encode');
	});

	// 7. Command: Base64 Decode
	const base64DecodeDisposable = vscode.commands.registerCommand('dev-toolkit.utility.base64Decode', () => {
		convertSelection(base64Decode, 'Base64 Decode');
	});



	// Đăng ký các command vào context subscriptions
	context.subscriptions.push(
		generateUUIDDisposable,
		toCamelCaseDisposable,
		toSnakeCaseDisposable,
		toPascalCaseDisposable,
		generateRandomStringDisposable,
		base64EncodeDisposable,
		base64DecodeDisposable
	);
}
