
export function generateRandomNumber(arrCalledNumber: number[]) {
    // Kiểm tra xem còn số nào có thể tạo không
    if (arrCalledNumber.length >= 90) {
        throw new Error("all_number_callled");
    }
    let randomNumber;
    do {
        randomNumber = Math.floor(Math.random() * 90) + 1;
    } while (arrCalledNumber.includes(randomNumber));

    return randomNumber;
}
