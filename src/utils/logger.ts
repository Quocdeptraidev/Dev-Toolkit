import * as vscode from 'vscode';

export class Logger {
	private static channel: vscode.OutputChannel | undefined;

	/**
	 * Khởi tạo Output Channel cho extension
	 */
	public static initialize(channelName: string = 'Dev Toolkit') {
		if (!this.channel) {
			this.channel = vscode.window.createOutputChannel(channelName);
		}
	}

	/**
	 * Ghi log định dạng chuẩn ra Output Channel
	 */
	private static log(level: 'INFO' | 'WARN' | 'ERROR', message: string) {
		if (!this.channel) {
			this.initialize();
		}
		const timestamp = new Date().toISOString();
		const logLine = `[${timestamp}] [${level}] ${message}`;
		this.channel?.appendLine(logLine);
	}

	public static info(message: string) {
		this.log('INFO', message);
	}

	public static warn(message: string) {
		this.log('WARN', message);
	}

	public static error(message: string, error?: any) {
		let errorMessage = message;
		if (error) {
			if (error instanceof Error) {
				errorMessage += ` - ${error.message}\nStack: ${error.stack}`;
			} else {
				errorMessage += ` - ${JSON.stringify(error)}`;
			}
		}
		this.log('ERROR', errorMessage);
	}

	/**
	 * Hiển thị cửa sổ Output Channel lên cho người dùng thấy
	 */
	public static show() {
		this.channel?.show();
	}
}
