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
