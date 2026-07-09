import * as vscode from 'vscode';
import { Logger } from './utils/logger';

export function activate(context: vscode.ExtensionContext) {
	// Khởi tạo hệ thống Log
	Logger.initialize('Dev Toolkit');
	Logger.info('Congratulations, your extension "dev-toolkit" is now active!');

	let disposable = vscode.commands.registerCommand('dev-toolkit.helloWorld', () => {
		Logger.info('Command "dev-toolkit.helloWorld" was triggered.');
		vscode.window.showInformationMessage('Hello World from Dev Toolkit!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	Logger.info('Extension "dev-toolkit" is now deactivated.');
}
