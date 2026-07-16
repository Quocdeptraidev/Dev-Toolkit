import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { GeminiProvider } from '../providers/aiProvider';

/**
 * Interface định nghĩa dịch vụ Git (Git Service).
 */
export interface IGitService {
    /**
     * Thực thi một lệnh Git bất kỳ.
     */
    executeGitCommand(workspacePath: string, args: string[]): Promise<string>;

    /**
     * Lấy Git Diff hiện tại của Workspace (bao gồm staged và unstaged).
     */
    getDiff(workspacePath: string): Promise<string>;

    /**
     * Tự động sinh Commit Message dựa trên Git Diff hiện tại.
     */
    generateCommitMessage(workspacePath: string): Promise<string>;

    /**
     * Tự động sinh nội dung CHANGELOG từ lịch sử commit.
     */
    generateChangelog(workspacePath: string): Promise<string>;

    /**
     * Tự động tạo bản nháp Release Notes từ lịch sử commit gần đây.
     */
    generateReleaseNotes(workspacePath: string): Promise<string>;

    /**
     * Đề xuất tên Branch chuẩn hóa (kebab-case) từ loại branch và mô tả.
     */
    suggestBranchName(type: string, description: string): string;
}

/**
 * Triển khai dịch vụ Git Service.
 */
export class GitService implements IGitService {
    private aiProvider: GeminiProvider;

    constructor() {
        this.aiProvider = new GeminiProvider();
    }

    /**
     * Thực thi một lệnh Git shell an toàn.
     */
    public executeGitCommand(workspacePath: string, args: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const cmd = `git ${args.join(' ')}`;
            Logger.info(`Đang chạy lệnh Git: ${cmd} tại ${workspacePath}`);

            exec(cmd, { cwd: workspacePath }, (error, stdout, stderr) => {
                if (error) {
                    Logger.error(`Lỗi khi thực thi lệnh Git: ${cmd}`, error);
                    reject(new Error(stderr || stdout || error.message));
                } else {
                    resolve(stdout.trim());
                }
            });
        });
    }

    /**
     * Lấy Git Diff hiện tại của Workspace (bao gồm cả staged và unstaged).
     */
    public async getDiff(workspacePath: string): Promise<string> {
        try {
            // Kiểm tra xem đây có phải là Git repo không
            await this.executeGitCommand(workspacePath, ['rev-parse', '--is-inside-work-tree']);

            // Lấy diff của phần staged (đã add)
            const stagedDiff = await this.executeGitCommand(workspacePath, ['diff', '--cached']);
            // Lấy diff của phần unstaged (chưa add, bao gồm cả file đã sửa nhưng chưa add)
            const unstagedDiff = await this.executeGitCommand(workspacePath, ['diff']);

            const combinedDiff = [stagedDiff, unstagedDiff].filter(d => d.trim().length > 0).join('\n');

            return combinedDiff;
        } catch (error: any) {
            Logger.error('Lỗi khi lấy Git Diff', error);
            throw new Error(`Không thể lấy Git Diff: ${error.message || error}`);
        }
    }

    /**
     * Tự động sinh Commit Message dựa trên Git Diff hiện tại sử dụng AI.
     */
    public async generateCommitMessage(workspacePath: string): Promise<string> {
        const diff = await this.getDiff(workspacePath);
        if (!diff) {
            throw new Error('Không phát hiện thay đổi (diff) nào trong workspace của bạn để tạo commit message.');
        }

        // Giới hạn kích thước diff gửi đi để tránh quá tải token (khoảng 15000 ký tự)
        let trimmedDiff = diff;
        if (diff.length > 15000) {
            trimmedDiff = diff.slice(0, 15000) + '\n\n... [Đã cắt bớt diff do quá dài]';
        }

        const prompt = `Bạn là một công cụ sinh Commit Message tự động chuyên nghiệp. Hãy phân tích đoạn Git Diff sau và tạo ra một commit message chuẩn Conventional Commits.

Yêu cầu nghiêm ngặt:
1. Định dạng Header: <type>(<scope>): <subject>
   - <type> bắt buộc phải là một trong các giá trị sau: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
   - <scope> là phạm vi ảnh hưởng (ví dụ: git, crud, view, config). Có thể bỏ qua nếu không rõ ràng.
   - <subject> viết bằng Tiếng Anh ngắn gọn, súc tích (dưới 72 ký tự), viết ở thì hiện tại (ví dụ: add command, fix bug), không viết hoa chữ cái đầu và không kết thúc bằng dấu chấm.
2. Nếu thay đổi có nhiều phần hoặc phức tạp, hãy thêm phần mô tả chi tiết (Body) cách phần Header một dòng trống. Các dòng trong Body không dài quá 72 ký tự và sử dụng dấu gạch đầu dòng (-) để liệt kê chi tiết.
3. CHỈ TRẢ VỀ DUY NHẤT nội dung commit message. KHÔNG giải thích gì thêm, KHÔNG đặt trong block code markdown (\`\`\`).

Đoạn Git Diff:
${trimmedDiff}`;

        try {
            const commitMessage = await this.aiProvider.generateText(prompt);
            return commitMessage;
        } catch (error: any) {
            Logger.error('Lỗi khi gửi AI sinh Commit Message', error);
            throw new Error(`Sinh Commit Message bằng AI thất bại: ${error.message || error}`);
        }
    }

    /**
     * Tự động tạo bản nháp Release Notes từ lịch sử commit gần đây.
     */
    public async generateReleaseNotes(workspacePath: string): Promise<string> {
        try {
            // Lấy danh sách 20 commits gần nhất để sinh Release Notes
            const commitLogs = await this.executeGitCommand(workspacePath, [
                'log',
                '-n',
                '20',
                '--pretty=format:"* %s (%h) - %an"'
            ]);

            if (!commitLogs) {
                throw new Error('Không thể đọc lịch sử commit của dự án.');
            }

            const prompt = `Bạn là một Technical Writer chuyên nghiệp. Hãy phân tích lịch sử 20 commits gần nhất sau đây và viết một bản Release Notes bằng Tiếng Việt dạng Markdown thật đẹp mắt, chuyên nghiệp.

Yêu cầu:
1. Có tiêu đề lớn phù hợp và một đoạn giới thiệu/tóm tắt ngắn ở đầu về phiên bản này (nhấn mạnh các cải tiến chính).
2. Phân loại các thay đổi thành các danh mục rõ ràng (nếu có dữ liệu tương ứng):
   - 🚀 Tính năng mới (New Features)
   - 🐛 Sửa lỗi (Bug Fixes)
   - ⚡ Tối ưu hiệu suất & Cải tiến (Performance & Enhancements)
   - 📝 Tài liệu & Cấu hình hệ thống (Docs & Chores)
3. Liệt kê các commit dưới định dạng danh sách có gạch đầu dòng, ghi rõ nội dung thay đổi và tác giả, kèm mã hash rút gọn trong ngoặc đơn (ví dụ: (1a2b3c)).
4. Định dạng Markdown trực quan, gọn gàng, sử dụng các emoji hợp lý để làm nổi bật thông tin.
5. Chỉ trả về mã nguồn Markdown của Release Notes, không thêm lời chào hay giải thích gì bên ngoài.

Lịch sử commits:
${commitLogs}`;

            const releaseNotes = await this.aiProvider.generateText(prompt);
            return releaseNotes;
        } catch (error: any) {
            Logger.error('Lỗi khi sinh Release Notes', error);
            throw new Error(`Sinh Release Notes thất bại: ${error.message || error}`);
        }
    }

    /**
     * Tự động sinh nội dung CHANGELOG từ lịch sử commit bằng thuật toán phân tích Conventional Commits.
     */
    public async generateChangelog(workspacePath: string): Promise<string> {
        try {
            // Lấy lịch sử 100 commit gần nhất, định dạng: message|hash|author|date
            const rawLogs = await this.executeGitCommand(workspacePath, [
                'log',
                '-n',
                '100',
                '--pretty=format:"%s|%h|%an|%ad"',
                '--date=short'
            ]);

            if (!rawLogs) {
                throw new Error('Không đọc được lịch sử commit của dự án.');
            }

            const lines = rawLogs.split('\n').map(line => {
                // Loại bỏ dấu nháy kép bọc ngoài do git log sinh ra
                const cleanLine = line.replace(/^"|"$/g, '');
                const [message, hash, author, date] = cleanLine.split('|');
                return { message: message || '', hash: hash || '', author: author || '', date: date || '' };
            });

            // Gom nhóm commit
            const groups: { [key: string]: string[] } = {
                features: [],
                fixes: [],
                refactoring: [],
                perf: [],
                docs: [],
                others: []
            };

            lines.forEach(item => {
                const msg = item.message.trim();
                const hashLink = item.hash ? `(\`${item.hash}\`)` : '';
                const lineStr = `- ${msg} ${hashLink} - *by ${item.author}*`;

                if (/^(feat|feature)(\(.*\))?:/i.test(msg)) {
                    groups.features.push(lineStr);
                } else if (/^(fix|bugfix)(\(.*\))?:/i.test(msg)) {
                    groups.fixes.push(lineStr);
                } else if (/^refactor(\(.*\))?:/i.test(msg)) {
                    groups.refactoring.push(lineStr);
                } else if (/^perf(\(.*\))?:/i.test(msg)) {
                    groups.perf.push(lineStr);
                } else if (/^docs(\(.*\))?:/i.test(msg)) {
                    groups.docs.push(lineStr);
                } else {
                    // Bỏ qua các commit merge hoặc commit tự động rác
                    if (!/^Merge /i.test(msg)) {
                        groups.others.push(lineStr);
                    }
                }
            });

            // Lấy ngày hiện tại
            const currentDate = new Date().toISOString().split('T')[0];

            // Build phần nội dung mới
            let newContent = `## [Unreleased] - ${currentDate}\n\n`;

            if (groups.features.length > 0) {
                newContent += `### 🚀 Features\n${groups.features.join('\n')}\n\n`;
            }
            if (groups.fixes.length > 0) {
                newContent += `### 🐛 Bug Fixes\n${groups.fixes.join('\n')}\n\n`;
            }
            if (groups.refactoring.length > 0) {
                newContent += `### 🔨 Refactoring\n${groups.refactoring.join('\n')}\n\n`;
            }
            if (groups.perf.length > 0) {
                newContent += `### ⚡ Performance\n${groups.perf.join('\n')}\n\n`;
            }
            if (groups.docs.length > 0) {
                newContent += `### 📝 Documentation\n${groups.docs.join('\n')}\n\n`;
            }
            if (groups.others.length > 0) {
                newContent += `### 📦 Other Changes\n${groups.others.join('\n')}\n\n`;
            }

            const changelogPath = path.join(workspacePath, 'CHANGELOG.md');
            let finalChangelogContent = '';

            if (fs.existsSync(changelogPath)) {
                // Nếu file đã tồn tại, chèn nội dung mới ngay dưới dòng tiêu đề `# Changelog`
                const existing = fs.readFileSync(changelogPath, 'utf8');
                const titleIndex = existing.indexOf('# Changelog');

                if (titleIndex !== -1) {
                    const insertPos = titleIndex + '# Changelog'.length;
                    finalChangelogContent = existing.slice(0, insertPos) + '\n\n' + newContent + existing.slice(insertPos);
                } else {
                    finalChangelogContent = `# Changelog\n\n${newContent}${existing}`;
                }
            } else {
                finalChangelogContent = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${newContent}`;
            }

            // Ghi file CHANGELOG.md xuống workspace
            fs.writeFileSync(changelogPath, finalChangelogContent, 'utf8');
            Logger.info(`Đã cập nhật file CHANGELOG.md tại: ${changelogPath}`);

            return finalChangelogContent;
        } catch (error: any) {
            Logger.error('Lỗi khi sinh CHANGELOG', error);
            throw new Error(`Sinh CHANGELOG.md thất bại: ${error.message || error}`);
        }
    }

    /**
     * Đề xuất tên branch chuẩn hóa từ loại branch và mô tả.
     */
    public suggestBranchName(type: string, description: string): string {
        const cleanDesc = this.removeVietnameseTones(description)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')     // Thay ký tự đặc biệt bằng dấu gạch ngang
            .replace(/^-+|-+$/g, '')         // Bỏ gạch ngang thừa ở đầu/cuối
            .substring(0, 40);               // Giới hạn độ dài tên branch mô tả khoảng 40 ký tự

        return `${type}/${cleanDesc}`;
    }

    /**
     * Loại bỏ dấu Tiếng Việt của chuỗi ký tự.
     */
    private removeVietnameseTones(str: string): string {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ý|Ỳ|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        // Thay các ký tự kết hợp (combining diacritical marks)
        str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return str;
    }
}
