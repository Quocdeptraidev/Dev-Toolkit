import * as vscode from 'vscode';
import { ProjectService } from '../services/projectService';
import { IProjectInfo } from '../types/project';
import { Logger } from '../utils/logger';

/**
 * Đăng ký các command liên quan đến Phân tích Dự án (Phase 5)
 * 
 * @param context Context của Extension từ VS Code
 */
export function registerProjectCommands(context: vscode.ExtensionContext): void {
    const analyzeProjectDisposable = vscode.commands.registerCommand('dev-toolkit.project.analyze', async () => {
        try {
            // 1. Kiểm tra Workspace đang mở
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('Vui lòng mở một thư mục dự án (Workspace) trước khi tiến hành phân tích.');
                return;
            }

            // Hỗ trợ chọn workspace nếu có nhiều folder
            let selectedWorkspace = workspaceFolders[0];
            if (workspaceFolders.length > 1) {
                const folderSelection = await vscode.window.showQuickPick(
                    workspaceFolders.map(folder => ({
                        label: folder.name,
                        description: folder.uri.fsPath,
                        folder: folder
                    })),
                    { placeHolder: 'Chọn thư mục dự án bạn muốn phân tích chẩn đoán' }
                );
                
                if (!folderSelection) {
                    Logger.info('Người dùng đã hủy chọn thư mục dự án để phân tích.');
                    return;
                }
                selectedWorkspace = folderSelection.folder;
            }

            // 2. Chạy ProjectService để quét dự án dưới dạng Progress
            let projectInfo: IProjectInfo | undefined;
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Đang quét và phân tích dự án ${selectedWorkspace.name}...`,
                cancellable: false
            }, async () => {
                const projectService = new ProjectService();
                projectInfo = await projectService.getProjectDiagnostics(selectedWorkspace.uri.fsPath);
            });

            if (!projectInfo) {
                throw new Error('Không lấy được thông tin chẩn đoán dự án.');
            }

            // 3. Hiển thị Webview Dashboard kết quả
            showDiagnosticsDashboard(selectedWorkspace.name, projectInfo);

        } catch (error: any) {
            Logger.error('Lỗi khi thực hiện phân tích dự án', error);
            vscode.window.showErrorMessage(`Phân tích dự án thất bại: ${error.message || error}`);
        }
    });

    context.subscriptions.push(analyzeProjectDisposable);
}

/**
 * Tạo và hiển thị VS Code Webview Panel chứa Dashboard chẩn đoán dự án
 */
function showDiagnosticsDashboard(projectName: string, info: IProjectInfo): void {
    // Tạo Webview Panel mới
    const panel = vscode.window.createWebviewPanel(
        'projectDiagnostics',
        `Chẩn đoán: ${projectName}`,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    // Render nội dung HTML
    panel.webview.html = getWebviewContent(projectName, info);
}

/**
 * Sinh mã HTML và CSS cho giao diện Dashboard chẩn đoán dự án
 */
function getWebviewContent(projectName: string, info: IProjectInfo): string {
    const isSpring = info.type === 'spring';
    const isReact = info.type === 'react';

    // Định dạng loại Framework hiển thị
    let frameworkLabel = 'Unknown Platform';
    let frameworkColor = '#6b7280'; // gray
    if (isSpring) {
        frameworkLabel = 'Spring Boot (Java)';
        frameworkColor = '#3b82f6'; // blue
    } else if (isReact) {
        frameworkLabel = 'React (Web App)';
        frameworkColor = '#10b981'; // green
    }

    // Badge ngôn ngữ
    const languageLabel = isSpring ? 'Java' : (info.isTypeScript ? 'TypeScript' : 'JavaScript');
    const languageColor = isSpring ? '#eab308' : (info.isTypeScript ? '#06b6d4' : '#f97316');

    // Badge cấu trúc thư mục
    let structureLabel = 'Chưa xác định (Unknown)';
    if (info.folderStructure === 'layered') {
        structureLabel = 'Phân lớp (Layered Architecture)';
    } else if (info.folderStructure === 'modular') {
        structureLabel = 'Module/Feature-based';
    }

    // Generate list thư viện
    const libSpringList = [
        { key: 'lombok', name: 'Lombok (Auto Get/Set)', active: info.libraries.lombok },
        { key: 'jpa', name: 'Spring Data JPA', active: info.libraries.jpa },
        { key: 'mapstruct', name: 'MapStruct (Mapper)', active: info.libraries.mapstruct }
    ];

    const libReactList = [
        { key: 'tailwindcss', name: 'TailwindCSS (Style)', active: info.libraries.tailwindcss },
        { key: 'axios', name: 'Axios (HTTP Client)', active: info.libraries.axios },
        { key: 'reactHookForm', name: 'React Hook Form', active: info.libraries.reactHookForm }
    ];

    const currentLibs = isSpring ? libSpringList : (isReact ? libReactList : []);

    let libsHtml = '';
    if (currentLibs.length > 0) {
        currentLibs.forEach(lib => {
            const statusClass = lib.active ? 'status-active' : 'status-inactive';
            const statusText = lib.active ? 'Đã cài đặt' : 'Không sử dụng';
            libsHtml += `
                <div class="library-card ${statusClass}">
                    <div class="library-name">${lib.name}</div>
                    <div class="library-status">${statusText}</div>
                </div>
            `;
        });
    } else {
        libsHtml = '<div class="no-data">Không phát hiện thư viện bổ trợ đặc trưng nào.</div>';
    }

    // Generate các đề xuất thông minh (Recommendations)
    let recommendationsHtml = '';
    if (isSpring) {
        if (info.libraries.lombok) {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <span class="recommendation-icon">💡</span>
                    <div>
                        <strong>Tích hợp Lombok:</strong> Dự án có sử dụng Lombok. Khi bạn sinh code CRUD, Entity và DTO sẽ tự động áp dụng các annotations <code>@Data</code>, <code>@Builder</code>, <code>@NoArgsConstructor</code> thay vì viết code Getter/Setter thủ công.
                    </div>
                </div>
            `;
        } else {
            recommendationsHtml += `
                <div class="recommendation-item warning">
                    <span class="recommendation-icon">⚠️</span>
                    <div>
                        <strong>Không phát hiện Lombok:</strong> CRUD Generator sẽ sinh ra các phương thức Getter, Setter và Constructor tiêu chuẩn để đảm bảo mã nguồn biên dịch thành công.
                    </div>
                </div>
            `;
        }
        if (info.libraries.jpa) {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <span class="recommendation-icon">💡</span>
                    <div>
                        <strong>Sử dụng Spring Data JPA:</strong> Bộ Repository được sinh ra sẽ tự động extends <code>JpaRepository</code> và ánh xạ annotations JPA Entity chuẩn xác.
                    </div>
                </div>
            `;
        }
    } else if (isReact) {
        if (info.libraries.tailwindcss) {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <span class="recommendation-icon">💡</span>
                    <div>
                        <strong>Phát hiện TailwindCSS:</strong> Các components (Table, Form, Page) được sinh ra tiếp theo sẽ tự động áp dụng các class CSS tiện ích của TailwindCSS để tạo giao diện hiện đại và ăn khớp với style dự án.
                    </div>
                </div>
            `;
        } else {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <span class="recommendation-icon">💡</span>
                    <div>
                        <strong>Sử dụng CSS Thuần:</strong> Do không phát hiện TailwindCSS, mã nguồn sinh ra sẽ sử dụng cấu trúc class CSS Vanilla chuẩn để bạn dễ dàng custom layout theo ý muốn.
                    </div>
                </div>
            `;
        }
        if (info.libraries.axios) {
            recommendationsHtml += `
                <div class="recommendation-item">
                    <span class="recommendation-icon">💡</span>
                    <div>
                        <strong>Sử dụng Axios Client:</strong> custom Hook sẽ tự động áp dụng Axios để thực hiện các cuộc gọi API thay vì Fetch API tiêu chuẩn. *(Sẽ được tối ưu trong Phase 6)*.
                    </div>
                </div>
            `;
        }
    } else {
        recommendationsHtml = `
            <div class="recommendation-item info">
                <span class="recommendation-icon">ℹ️</span>
                <div>
                    <strong>Chưa xác định nền tảng:</strong> Hãy đảm bảo workspace của bạn chứa tệp cấu hình <code>package.json</code> hoặc <code>pom.xml</code> để Dev Toolkit phân tích chính xác nhất.
                </div>
            </div>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Báo cáo Chẩn đoán Dự án</title>
            <style>
                body {
                    font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    padding: 30px;
                    line-height: 1.6;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                h1 {
                    font-size: 28px;
                    margin: 0;
                    font-weight: 600;
                    color: var(--vscode-titleBar-activeForeground);
                }
                .project-name {
                    font-size: 14px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 5px;
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 30px;
                }
                @media (max-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .card {
                    background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(130, 130, 130, 0.08));
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid var(--vscode-panel-border);
                    margin-bottom: 25px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-top: 0;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 8px;
                }
                .metric-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(130, 130, 130, 0.1);
                }
                .metric-row:last-child {
                    border-bottom: none;
                }
                .metric-label {
                    font-weight: 500;
                    color: var(--vscode-descriptionForeground);
                }
                .metric-value {
                    font-weight: 600;
                }
                .badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    color: #ffffff;
                    font-weight: bold;
                }
                .library-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                .library-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 18px;
                    border-radius: 8px;
                    border: 1px solid var(--vscode-panel-border);
                    font-size: 14px;
                    transition: transform 0.2s;
                }
                .library-card:hover {
                    transform: translateX(4px);
                }
                .status-active {
                    background-color: rgba(16, 185, 129, 0.08);
                    border-color: rgba(16, 185, 129, 0.4);
                }
                .status-active .library-status {
                    color: #10b981;
                    font-weight: bold;
                }
                .status-inactive {
                    background-color: rgba(107, 114, 128, 0.05);
                    border-color: var(--vscode-panel-border);
                }
                .status-inactive .library-status {
                    color: var(--vscode-descriptionForeground);
                }
                .recommendation-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    padding: 16px;
                    background-color: rgba(59, 130, 246, 0.06);
                    border-left: 4px solid #3b82f6;
                    border-radius: 0 8px 8px 0;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                .recommendation-item.warning {
                    background-color: rgba(234, 179, 8, 0.06);
                    border-left-color: #eab308;
                }
                .recommendation-item.info {
                    background-color: rgba(107, 114, 128, 0.06);
                    border-left-color: #6b7280;
                }
                .recommendation-icon {
                    font-size: 20px;
                    line-height: 1;
                }
                code {
                    font-family: var(--vscode-editor-font-family, Consolas, Monaco, monospace);
                    background-color: rgba(130, 130, 130, 0.15);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 90%;
                }
                .no-data {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    padding: 20px;
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h1>Báo cáo Chẩn đoán Dự án</h1>
                        <div class="project-name">Dự án: <strong>${projectName}</strong></div>
                    </div>
                    <div>
                        <span class="badge" style="background-color: ${frameworkColor}; font-size: 14px; padding: 6px 14px;">
                            ${frameworkLabel}
                        </span>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="left-column">
                        <div class="card">
                            <h2 class="card-title">Cấu hình Hệ thống</h2>
                            <div class="metric-row">
                                <div class="metric-label">Loại dự án (Framework)</div>
                                <div class="metric-value">${frameworkLabel}</div>
                            </div>
                            <div class="metric-row">
                                <div class="metric-label">Ngôn ngữ lập trình</div>
                                <div class="metric-value">
                                    <span class="badge" style="background-color: ${languageColor}">
                                        ${languageLabel}
                                    </span>
                                </div>
                            </div>
                            <div class="metric-row">
                                <div class="metric-label">Kiến trúc tổ chức thư mục</div>
                                <div class="metric-value">${structureLabel}</div>
                            </div>
                        </div>

                        <div class="card">
                            <h2 class="card-title">Đề xuất từ Dev Toolkit (Convention Alignment)</h2>
                            <div class="recommendations-container">
                                ${recommendationsHtml}
                            </div>
                        </div>
                    </div>

                    <div class="right-column">
                        <div class="card">
                            <h2 class="card-title">Thư viện phát hiện</h2>
                            <div class="library-grid">
                                ${libsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}
