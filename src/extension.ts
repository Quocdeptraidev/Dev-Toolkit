import * as vscode from 'vscode';
import { Logger } from './utils/logger';
import { registerUtilityCommands } from './commands/utilityCommands';
import { registerCrudCommands } from './commands/crudCommands';
import { registerTemplateCommands } from './commands/templateCommands';
import { registerProjectCommands } from './commands/projectCommands';
import { registerGitCommands } from './commands/gitCommands';

export function activate(context: vscode.ExtensionContext) {
	// Khởi tạo hệ thống Log
	Logger.initialize('Dev Toolkit');
	Logger.info('Congratulations, your extension "dev-toolkit" is now active!');

	// Đăng ký các lệnh cơ bản
	const disposable = vscode.commands.registerCommand('dev-toolkit.helloWorld', () => {
		Logger.info('Command "dev-toolkit.helloWorld" was triggered.');
		vscode.window.showInformationMessage('Hello World from Dev Toolkit!');
	});
	context.subscriptions.push(disposable);

	// Đăng ký các lệnh tiện ích (Milestone 2)
	registerUtilityCommands(context);

	// Đăng ký các lệnh sinh CRUD (Milestone 3 / Phase 3)
	registerCrudCommands(context);

	// Đăng ký các lệnh quản lý Template (Phase 4)
	registerTemplateCommands(context);

	// Đăng ký các lệnh phân tích dự án (Phase 5)
	registerProjectCommands(context);

	// Đăng ký các lệnh Git Toolkit (Phase 7)
	registerGitCommands(context);
}

export function deactivate() {
	Logger.info('Extension "dev-toolkit" is now deactivated.');
}
