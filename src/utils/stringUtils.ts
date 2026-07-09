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
