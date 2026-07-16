import * as fs from 'fs';
import * as path from 'path';
import { IProjectInfo } from '../types/project';
import { Logger } from '../utils/logger';

/**
 * Lớp chịu trách nhiệm quét và phân tích dự án hiện tại để trích xuất cấu hình và convention.
 */
export class ProjectAnalyzer {

    /**
     * Thực hiện quét và phân tích dự án tại đường dẫn workspace cho trước.
     * 
     * @param workspacePath Đường dẫn tuyệt đối tới workspace dự án
     * @param targetPath Đường dẫn thư mục đích muốn sinh code (dùng để nhận dạng naming convention)
     * @returns Thông tin chẩn đoán dự án IProjectInfo
     */
    public async analyze(workspacePath: string, targetPath?: string): Promise<IProjectInfo> {
        const info: IProjectInfo = {
            type: 'unknown',
            isTypeScript: false,
            libraries: {},
            folderStructure: 'unknown'
        };

        try {
            Logger.info(`ProjectAnalyzer bắt đầu phân tích dự án tại: ${workspacePath}`);

            // 1. Phân tích dự án Node.js / React (package.json)
            const packageJsonPath = path.join(workspacePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                this.analyzePackageJson(packageJsonPath, info);
            }

            // 2. Kiểm tra tsconfig.json và cấu hình path aliases
            const tsconfigPath = path.join(workspacePath, 'tsconfig.json');
            if (fs.existsSync(tsconfigPath)) {
                info.isTypeScript = true;
                this.analyzeTsConfig(tsconfigPath, info);
            } else {
                info.importStyle = 'relative';
            }

            // 3. Phân tích dự án Maven Spring Boot (pom.xml)
            const pomXmlPath = path.join(workspacePath, 'pom.xml');
            if (fs.existsSync(pomXmlPath)) {
                this.analyzePomXml(pomXmlPath, info);
            }

            // 4. Phân tích dự án Gradle Spring Boot (build.gradle)
            const gradlePath = path.join(workspacePath, 'build.gradle');
            if (fs.existsSync(gradlePath)) {
                this.analyzeGradle(gradlePath, info);
            }

            // 5. Nhận diện cấu trúc thư mục dự án
            info.folderStructure = this.detectFolderStructure(workspacePath, info.type);

            // 6. Nhận diện quy cách đặt tên file hiện có tại thư mục đích
            info.namingConvention = this.detectNamingConvention(targetPath || workspacePath);

            Logger.info(`Phân tích dự án thành công: Type=${info.type}, TS=${info.isTypeScript}, Structure=${info.folderStructure}, Import=${info.importStyle}, Naming=${info.namingConvention}`);
            return info;
        } catch (error) {
            Logger.error(`Lỗi trong quá trình phân tích dự án tại: ${workspacePath}`, error);
            return info; // Trả về thông tin mặc định thay vì crash
        }
    }

    /**
     * Phân tích tệp package.json để phát hiện React, TypeScript và các thư viện frontend.
     */
    private analyzePackageJson(packageJsonPath: string, info: IProjectInfo): void {
        try {
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            const pkg = JSON.parse(content);

            const allDeps = {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {})
            };

            // Nhận diện React
            if (allDeps['react']) {
                info.type = 'react';
            }

            // Nhận diện TypeScript
            if (allDeps['typescript']) {
                info.isTypeScript = true;
            }

            // Nhận diện các thư viện Frontend bổ trợ
            if (allDeps['tailwindcss']) {
                info.libraries.tailwindcss = true;
            }
            if (allDeps['axios']) {
                info.libraries.axios = true;
            }
            if (allDeps['react-hook-form']) {
                info.libraries.reactHookForm = true;
            }
        } catch (error) {
            Logger.error(`Lỗi khi parse package.json: ${packageJsonPath}`, error);
        }
    }

    /**
     * Phân tích pom.xml (Maven) của Spring Boot bằng Regex.
     */
    private analyzePomXml(pomXmlPath: string, info: IProjectInfo): void {
        try {
            info.type = 'spring';
            const content = fs.readFileSync(pomXmlPath, 'utf-8');

            // Quét dependencies bằng Regex
            if (/<artifactId>lombok<\/artifactId>/i.test(content)) {
                info.libraries.lombok = true;
            }
            if (/<artifactId>mapstruct<\/artifactId>/i.test(content)) {
                info.libraries.mapstruct = true;
            }
            if (/<artifactId>spring-boot-starter-data-jpa<\/artifactId>/i.test(content)) {
                info.libraries.jpa = true;
            }
        } catch (error) {
            Logger.error(`Lỗi khi đọc file pom.xml: ${pomXmlPath}`, error);
        }
    }

    /**
     * Phân tích build.gradle (Gradle) của Spring Boot bằng Regex.
     */
    private analyzeGradle(gradlePath: string, info: IProjectInfo): void {
        try {
            info.type = 'spring';
            const content = fs.readFileSync(gradlePath, 'utf-8');

            // Quét dependencies bằng Regex
            if (/lombok/i.test(content)) {
                info.libraries.lombok = true;
            }
            if (/mapstruct/i.test(content)) {
                info.libraries.mapstruct = true;
            }
            if (/spring-boot-starter-data-jpa/i.test(content)) {
                info.libraries.jpa = true;
            }
        } catch (error) {
            Logger.error(`Lỗi khi đọc file build.gradle: ${gradlePath}`, error);
        }
    }

    /**
     * Nhận diện cấu trúc tổ chức thư mục (Layered vs Modular).
     */
    private detectFolderStructure(workspacePath: string, type: 'spring' | 'react' | 'unknown'): 'layered' | 'modular' | 'unknown' {
        if (type === 'unknown') {
            return 'unknown';
        }

        try {
            if (type === 'react') {
                const srcPath = path.join(workspacePath, 'src');
                if (!fs.existsSync(srcPath)) return 'unknown';

                const subdirs = fs.readdirSync(srcPath).filter(file => {
                    return fs.statSync(path.join(srcPath, file)).isDirectory();
                });

                // Nếu có các folder phân lớp phổ biến ở cấp cao nhất của src/
                const hasLayeredFolders = subdirs.some(dir => 
                    ['components', 'pages', 'views', 'hooks', 'services', 'utils'].includes(dir)
                );

                // Nếu tổ chức dạng module (ví dụ có folder features, modules)
                const hasModularFolders = subdirs.some(dir => 
                    ['features', 'modules', 'features-layout', 'features-modules'].includes(dir)
                );

                if (hasModularFolders) return 'modular';
                if (hasLayeredFolders) return 'layered';
            }

            if (type === 'spring') {
                const srcJavaPath = path.join(workspacePath, 'src', 'main', 'java');
                if (!fs.existsSync(srcJavaPath)) return 'unknown';

                // Tìm đệ quy xem có các folder controller/service/repository không
                const foundFolders = {
                    controller: false,
                    service: false,
                    repository: false
                };

                const checkFoldersRecursive = (dirPath: string, depth = 0) => {
                    // Giới hạn độ sâu quét tối đa 5 cấp để tránh treo
                    if (depth > 5) return;

                    const files = fs.readdirSync(dirPath);
                    for (const file of files) {
                        const fullPath = path.join(dirPath, file);
                        if (fs.statSync(fullPath).isDirectory()) {
                            const dirNameLower = file.toLowerCase();
                            if (dirNameLower === 'controller' || dirNameLower === 'controllers' || dirNameLower === 'api') {
                                foundFolders.controller = true;
                            }
                            if (dirNameLower === 'service' || dirNameLower === 'services') {
                                foundFolders.service = true;
                            }
                            if (dirNameLower === 'repository' || dirNameLower === 'repositories' || dirNameLower === 'dao') {
                                foundFolders.repository = true;
                            }
                            
                            // Quét tiếp con
                            checkFoldersRecursive(fullPath, depth + 1);
                        }
                    }
                };

                checkFoldersRecursive(srcJavaPath);

                // Nếu tìm thấy tối thiểu 2 trong 3 folder phân lớp
                const matchCount = (foundFolders.controller ? 1 : 0) + 
                                   (foundFolders.service ? 1 : 0) + 
                                   (foundFolders.repository ? 1 : 0);
                
                if (matchCount >= 2) {
                    return 'layered';
                }
            }
        } catch (error) {
            Logger.error(`Lỗi khi nhận diện cấu trúc thư mục: ${workspacePath}`, error);
        }

        return 'unknown';
    }

    /**
     * Phân tích tsconfig.json để phát hiện alias import.
     */
    private analyzeTsConfig(tsconfigPath: string, info: IProjectInfo): void {
        try {
            let content = fs.readFileSync(tsconfigPath, 'utf-8');
            // Loại bỏ comment trong JSON (nếu có) để parse được bằng JSON.parse
            content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
            const tsconfig = JSON.parse(content);
            const paths = tsconfig.compilerOptions?.paths;

            if (paths && Object.keys(paths).some(key => key.startsWith('@/'))) {
                info.importStyle = 'absolute';
            } else {
                info.importStyle = 'relative';
            }
        } catch (error) {
            Logger.error(`Lỗi khi parse tsconfig.json: ${tsconfigPath}`, error);
            info.importStyle = 'relative';
        }
    }

    /**
     * Nhận diện quy cách đặt tên file hiện tại trong thư mục nguồn đích.
     */
    private detectNamingConvention(dirPath: string): 'pascal' | 'kebab' | 'camel' {
        try {
            if (!fs.existsSync(dirPath)) return 'pascal';

            const files = fs.readdirSync(dirPath);
            let kebabCount = 0;
            let camelCount = 0;
            let pascalCount = 0;

            for (const file of files) {
                const ext = path.extname(file);
                // Chỉ phân tích các file code nguồn
                if (!['.ts', '.tsx', '.js', '.jsx', '.java'].includes(ext)) continue;

                const baseName = path.basename(file, ext);
                if (baseName.includes('-')) {
                    kebabCount++;
                } else if (/^[A-Z]/.test(baseName)) {
                    pascalCount++;
                } else if (/^[a-z]/.test(baseName)) {
                    camelCount++;
                }
            }

            const max = Math.max(kebabCount, pascalCount, camelCount);
            if (max === 0) return 'pascal'; // Mặc định là PascalCase
            if (max === kebabCount) return 'kebab';
            if (max === camelCount) return 'camel';
            return 'pascal';
        } catch (error) {
            Logger.error(`Lỗi khi nhận diện quy cách đặt tên tại: ${dirPath}`, error);
            return 'pascal';
        }
    }
}
