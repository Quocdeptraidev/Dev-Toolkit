import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "dev-toolkit" is now active!');

	let disposable = vscode.commands.registerCommand('dev-toolkit.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Dev Toolkit!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
