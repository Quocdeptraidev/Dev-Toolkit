import * as vscode from 'vscode';
import * as https from 'https';
import { Logger } from '../utils/logger';

/**
 * Interface định nghĩa một AI Provider dùng chung cho extension.
 */
export interface IAIProvider {
    /**
     * Gửi prompt lên mô hình AI và nhận kết quả dạng văn bản.
     * 
     * @param prompt Câu lệnh (Prompt) gửi tới AI
     * @returns Chuỗi kết quả trả về từ AI
     */
    generateText(prompt: string): Promise<string>;
}

/**
 * Triển khai AI Provider sử dụng Google Gemini API qua HTTP request thuần.
 */
export class GeminiProvider implements IAIProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey?: string, model?: string) {
        // Lấy API Key và Model từ VS Code configuration nếu không được truyền vào trực tiếp
        const config = vscode.workspace.getConfiguration('dev-toolkit.ai');
        this.apiKey = apiKey || config.get<string>('apiKey') || '';
        this.model = model || config.get<string>('model') || 'gemini-1.5-flash';
    }

    /**
     * Gửi prompt lên Gemini API và nhận kết quả.
     */
    public async generateText(prompt: string): Promise<string> {
        if (!this.apiKey) {
            // Nếu không có API Key, hiển thị thông báo lỗi và yêu cầu người dùng cấu hình
            const inputKey = await vscode.window.showInputBox({
                prompt: 'Vui lòng cung cấp Gemini API Key để thực hiện tác vụ này',
                placeHolder: 'Nhập Gemini API Key của bạn tại đây...',
                password: true,
                ignoreFocusOut: true
            });

            if (!inputKey) {
                const errMsg = 'Tác vụ bị hủy: Chưa cấu hình Gemini API Key.';
                Logger.error(errMsg);
                throw new Error(errMsg);
            }

            // Lưu API Key vào Global configuration để sử dụng cho lần sau
            const config = vscode.workspace.getConfiguration('dev-toolkit.ai');
            await config.update('apiKey', inputKey, vscode.ConfigurationTarget.Global);
            this.apiKey = inputKey;
            vscode.window.showInformationMessage('Đã lưu Gemini API Key thành công vào cấu hình VS Code.');
        }

        Logger.info(`Đang gửi request tới Gemini API (Model: ${this.model})...`);

        return new Promise<string>((resolve, reject) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
            
            const requestData = JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.2 // Dùng temperature thấp để kết quả ổn định và đúng format hơn
                }
            });

            const req = https.request(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestData)
                    },
                    timeout: 20000 // Timeout sau 20s
                },
                (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            try {
                                const responseJson = JSON.parse(data);
                                const text = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
                                if (text) {
                                    resolve(text.trim());
                                } else {
                                    const errText = 'Phản hồi từ Gemini API không chứa nội dung văn bản hợp lệ.';
                                    Logger.error(errText + ` JSON nhận được: ${data}`);
                                    reject(new Error(errText));
                                }
                            } catch (e: any) {
                                const errText = `Lỗi phân tích JSON phản hồi từ Gemini API: ${e.message || e}`;
                                Logger.error(errText);
                                reject(new Error(errText));
                            }
                        } else {
                            const errText = `Gemini API trả về mã lỗi HTTP ${res.statusCode}. Chi tiết: ${data}`;
                            Logger.error(errText);
                            reject(new Error(`Lỗi kết nối Gemini API (${res.statusCode}). Vui lòng kiểm tra lại API Key hoặc mạng.`));
                        }
                    });
                }
            );

            req.on('error', (err) => {
                const errText = `Lỗi request Gemini API: ${err.message || err}`;
                Logger.error(errText, err);
                reject(new Error(errText));
            });

            req.on('timeout', () => {
                req.destroy();
                const errText = 'Yêu cầu tới Gemini API bị quá thời gian chờ (Timeout 20s).';
                Logger.error(errText);
                reject(new Error(errText));
            });

            req.write(requestData);
            req.end();
        });
    }
}
