/**
 * Chuyển đổi một chuỗi bất kỳ sang định dạng camelCase.
 * Ví dụ: "hello-world" -> "helloWorld", "Hello World" -> "helloWorld"
 * 
 * @param str Chuỗi đầu vào cần chuyển đổi
 * @returns Chuỗi kết quả định dạng camelCase
 */
export function toCamelCase(str: string): string {
	if (!str) {
		return '';
	}

	let temp = str;
	// Nếu chuỗi viết hoa toàn bộ (ví dụ: CONSTANT_CASE), đưa về chữ thường trước
	if (str === str.toUpperCase() && (str.includes('_') || str.includes('-'))) {
		temp = str.toLowerCase();
	}

	return temp
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Tách chữ thường và chữ hoa liền nhau (ví dụ: helloWorld -> hello World)
		.replace(/[^a-zA-Z0-9]+/g, ' ')       // Loại bỏ ký tự đặc biệt, thay bằng khoảng trắng
		.trim()
		.split(/\s+/)
		.map((word, index) => {
			if (index === 0) {
				return word.toLowerCase();
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('');
}

/**
 * Chuyển đổi một chuỗi bất kỳ sang định dạng snake_case.
 * Ví dụ: "helloWorld" -> "hello_world", "Hello-World" -> "hello_world"
 * 
 * @param str Chuỗi đầu vào cần chuyển đổi
 * @returns Chuỗi kết quả định dạng snake_case
 */
export function toSnakeCase(str: string): string {
	if (!str) {
		return '';
	}

	return str
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2') // Tách chữ thường và chữ hoa bằng gạch dưới
		.replace(/[^a-zA-Z0-9]+/g, '_')        // Thay thế ký tự đặc biệt/khoảng trắng bằng gạch dưới
		.replace(/__+/g, '_')                  // Loại bỏ nhiều gạch dưới liền nhau
		.replace(/^_+|_+$/g, '')               // Loại bỏ gạch dưới thừa ở đầu và cuối chuỗi
		.toLowerCase();
}

/**
 * Chuyển đổi một chuỗi bất kỳ sang định dạng PascalCase.
 * Ví dụ: "hello-world" -> "HelloWorld", "hello_world" -> "HelloWorld"
 * 
 * @param str Chuỗi đầu vào cần chuyển đổi
 * @returns Chuỗi kết quả định dạng PascalCase
 */
export function toPascalCase(str: string): string {
	if (!str) {
		return '';
	}

	let temp = str;
	if (str === str.toUpperCase() && (str.includes('_') || str.includes('-'))) {
		temp = str.toLowerCase();
	}

	return temp
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.trim()
		.split(/\s+/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('');
}

/**
 * Sinh một chuỗi ký tự ngẫu nhiên gồm chữ hoa, chữ thường và số.
 * 
 * @param length Độ dài của chuỗi cần sinh
 * @returns Chuỗi ngẫu nhiên được sinh ra
 */
export function generateRandomString(length: number): string {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}


/**
 * Mã hóa một chuỗi ký tự sang định dạng Base64.
 * 
 * @param str Chuỗi đầu vào dạng UTF-8
 * @returns Chuỗi kết quả đã được mã hóa Base64
 */
export function base64Encode(str: string): string {
	if (!str) {
		return '';
	}
	return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Giải mã một chuỗi Base64 về chuỗi ký tự thông thường.
 * 
 * @param str Chuỗi đầu vào dạng Base64
 * @returns Chuỗi kết quả sau giải mã dạng UTF-8
 */
export function base64Decode(str: string): string {
	if (!str) {
		return '';
	}
	return Buffer.from(str, 'base64').toString('utf-8');
}


/**
 * Hỗ trợ giải mã chuỗi định dạng Base64URL sang UTF-8.
 */
function base64UrlDecode(str: string): string {
	// Chuyển đổi ký tự Base64URL sang Base64 chuẩn
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

	// Thêm ký tự padding '=' nếu chiều dài chuỗi không chia hết cho 4
	while (base64.length % 4) {
		base64 += '=';
	}
	return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Giải mã JWT Token (trả về JSON String của Header và Payload đã được format đẹp mắt).
 * 
 * @param token Chuỗi JWT Token (Header.Payload.Signature)
 * @returns Chuỗi JSON đã format chứa Header và Payload
 */
export function decodeJWT(token: string): string {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('Định dạng JWT không hợp lệ (JWT phải chứa đúng 3 phần phân tách bởi dấu chấm).');
	}

	try {
		const headerJson = JSON.parse(base64UrlDecode(parts[0]));
		const payloadJson = JSON.parse(base64UrlDecode(parts[1]));

		// Trả về JSON được format thụt lề 4 khoảng trắng cho đẹp mắt
		return JSON.stringify({
			header: headerJson,
			payload: payloadJson
		}, null, 4);
	} catch (e) {
		throw new Error('Giải mã JWT thất bại (Base64url không hợp lệ hoặc dữ liệu không phải JSON).');
	}
}

/**
 * Biên dịch một chuỗi JSON thành các định nghĩa Interface TypeScript tương ứng.
 * Hỗ trợ đệ quy các object lồng nhau và mảng.
 * 
 * @param jsonText Chuỗi JSON hợp lệ
 * @param rootInterfaceName Tên của interface gốc (mặc định: RootObject)
 * @returns Chuỗi code chứa các Interface TypeScript được định dạng đẹp mắt
 */
export function jsonToTypeScript(jsonText: string, rootInterfaceName: string = 'RootObject'): string {
	let parsed: any;
	try {
		parsed = JSON.parse(jsonText);
	} catch (e) {
		throw new Error('Đoạn văn bản bôi đen không phải là JSON hợp lệ.');
	}

	const interfaces: string[] = [];
	const generatedNames = new Set<string>();

	// Hàm helper chuyển key sang PascalCase để làm tên Interface
	function toPascalCaseName(str: string): string {
		if (!str) {
			return 'Key';
		}
		return str
			.replace(/[^a-zA-Z0-9]+/g, ' ')
			.trim()
			.split(/\s+/)
			.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join('');
	}

	// Đảm bảo không trùng tên interface
	function getUniqueInterfaceName(name: string): string {
		let uniqueName = name;
		let count = 1;
		while (generatedNames.has(uniqueName)) {
			uniqueName = `${name}${count}`;
			count++;
		}
		generatedNames.add(uniqueName);
		return uniqueName;
	}

	// Hàm đệ quy phân tích Object và sinh Interface
	function parseObject(obj: any, interfaceName: string): string {
		if (obj === null) {
			return 'null';
		}

		if (Array.isArray(obj)) {
			if (obj.length === 0) {
				return 'unknown[]';
			}
			const types = new Set<string>();
			obj.forEach(item => {
				types.add(getType(item, interfaceName + 'Item'));
			});
			const typeStr = Array.from(types).join(' | ');
			return typeStr.includes(' ') ? `(${typeStr})[]` : `${typeStr}[]`;
		}

		if (typeof obj === 'object') {
			const uniqueName = getUniqueInterfaceName(interfaceName);
			let content = `export interface ${uniqueName} {\n`;
			for (const key of Object.keys(obj)) {
				const value = obj[key];
				const subName = toPascalCaseName(key);
				const type = getType(value, subName);
				content += `\t${key}: ${type};\n`;
			}
			content += `}\n`;
			interfaces.push(content);
			return uniqueName;
		}

		return typeof obj;
	}

	// Hàm lấy kiểu dữ liệu
	function getType(value: any, subInterfaceName: string): string {
		if (value === null) {
			return 'null';
		}
		if (Array.isArray(value)) {
			if (value.length === 0) {
				return 'unknown[]';
			}
			const types = new Set<string>();
			value.forEach(item => {
				types.add(getType(item, subInterfaceName));
			});
			const typeStr = Array.from(types).join(' | ');
			return typeStr.includes(' ') ? `(${typeStr})[]` : `${typeStr}[]`;
		}
		if (typeof value === 'object') {
			return parseObject(value, subInterfaceName);
		}
		return typeof value;
	}

	// Xử lý dữ liệu đầu vào tại Root
	if (Array.isArray(parsed)) {
		if (parsed.length === 0) {
			return `export type ${rootInterfaceName} = unknown[];`;
		}
		const itemType = getType(parsed[0], rootInterfaceName + 'Item');
		const finalInterfaces = interfaces.reverse().join('\n');
		return `${finalInterfaces}\nexport type ${rootInterfaceName} = ${itemType}[];`;
	} else if (typeof parsed === 'object' && parsed !== null) {
		parseObject(parsed, rootInterfaceName);
		return interfaces.reverse().join('\n');
	} else {
		return `export type ${rootInterfaceName} = ${typeof parsed};`;
	}
}


/**
 * Biên dịch một chuỗi JSON thành các định nghĩa Class Java DTO tương ứng.
 * Hỗ trợ Lombok annotations (@Data, @Builder, v.v.) và Jackson (@JsonProperty).
 * 
 * @param jsonText Chuỗi JSON hợp lệ
 * @param rootClassName Tên của class gốc (mặc định: RootDto)
 * @returns Chuỗi code chứa các Class Java DTO được định dạng đẹp mắt
 */
export function jsonToJavaDto(jsonText: string, rootClassName: string = 'RootDto'): string {
	let parsed: any;
	try {
		parsed = JSON.parse(jsonText);
	} catch (e) {
		throw new Error('Đoạn văn bản bôi đen không phải là JSON hợp lệ.');
	}

	const classes: string[] = [];
	const generatedNames = new Set<string>();

	// Helper chuyển đổi key sang PascalCase cho Class name
	function toPascalCaseName(str: string): string {
		if (!str) {
			return 'Key';
		}
		return str
			.replace(/[^a-zA-Z0-9]+/g, ' ')
			.trim()
			.split(/\s+/)
			.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join('');
	}

	// Đảm bảo không trùng tên class và tự động thêm hậu tố 'Dto' nếu thiếu
	function getUniqueClassName(name: string): string {
		let uniqueName = name;
		if (!uniqueName.endsWith('Dto') && !uniqueName.endsWith('DTO')) {
			uniqueName += 'Dto';
		}
		let finalName = uniqueName;
		let count = 1;
		while (generatedNames.has(finalName)) {
			finalName = `${uniqueName}${count}`;
			count++;
		}
		generatedNames.add(finalName);
		return finalName;
	}

	// Ánh xạ kiểu dữ liệu từ JS/JSON sang Java
	function getJavaType(value: any, keyName: string): string {
		if (value === null) {
			return 'Object';
		}

		if (Array.isArray(value)) {
			if (value.length === 0) {
				return 'List<Object>';
			}
			const itemType = getJavaType(value[0], keyName);
			return `List<${itemType}>`;
		}

		if (typeof value === 'object') {
			const className = toPascalCaseName(keyName);
			return parseObject(value, className);
		}

		if (typeof value === 'number') {
			return Number.isInteger(value) ? 'Integer' : 'Double';
		}

		if (typeof value === 'boolean') {
			return 'Boolean';
		}

		return 'String';
	}

	// Phân tích object và tạo class Java
	function parseObject(obj: any, className: string): string {
		if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
			return 'Object';
		}

		const uniqueName = getUniqueClassName(className);

		let content = `import lombok.Data;\n`;
		content += `import lombok.Builder;\n`;
		content += `import lombok.NoArgsConstructor;\n`;
		content += `import lombok.AllArgsConstructor;\n`;
		content += `import com.fasterxml.jackson.annotation.JsonProperty;\n`;

		// Kiểm tra xem có thuộc tính nào là List để import java.util.List không
		let hasList = false;
		for (const key of Object.keys(obj)) {
			if (Array.isArray(obj[key])) {
				hasList = true;
				break;
			}
		}
		if (hasList) {
			content += `import java.util.List;\n`;
		}

		content += `\n`;
		content += `@Data\n`;
		content += `@Builder\n`;
		content += `@NoArgsConstructor\n`;
		content += `@AllArgsConstructor\n`;
		content += `public class ${uniqueName} {\n\n`;

		for (const key of Object.keys(obj)) {
			const value = obj[key];
			const type = getJavaType(value, key);
			content += `\t@JsonProperty("${key}")\n`;
			content += `\tprivate ${type} ${key};\n\n`;
		}

		content += `}\n`;
		classes.push(content);
		return uniqueName;
	}

	// Xử lý Root
	if (Array.isArray(parsed)) {
		if (parsed.length === 0) {
			return `// JSON Array rỗng không thể sinh DTO.`;
		}
		getJavaType(parsed[0], rootClassName);
		return classes.reverse().join('\n\n');
	} else if (typeof parsed === 'object' && parsed !== null) {
		parseObject(parsed, rootClassName);
		return classes.reverse().join('\n\n');
	} else {
		return `// JSON root không phải object/array.`;
	}
}


