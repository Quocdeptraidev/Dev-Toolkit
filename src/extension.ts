import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { registerUtilityCommands } from './commands/utilityCommands';

export function activate(context: vscode.ExtensionContext) {
	// Khởi tạo hệ thống Log
	Logger.initialize('Dev Toolkit');
	Logger.info('Congratulations, your extension "dev-toolkit" is now active!');

	// Đăng ký các lệnh cơ bản
	let disposable = vscode.commands.registerCommand('dev-toolkit.helloWorld', () => {
		Logger.info('Command "dev-toolkit.helloWorld" was triggered.');
		vscode.window.showInformationMessage('Hello World from Dev Toolkit!');
	});
	context.subscriptions.push(disposable);

	// Đăng ký các lệnh tiện ích (Milestone 2)
	registerUtilityCommands(context);
}

export function deactivate() {
	Logger.info('Extension "dev-toolkit" is now deactivated.');
}
