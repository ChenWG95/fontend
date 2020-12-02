/**
 * 冒泡排序
 * 
 * 算法思路：
 */
var arr = [1, 5, 2, 4, 3]

for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j+1]) {
            const n = arr[j]
            arr[j] = arr[j+1]
            arr[j+1] = n
        }
    }
}

console.log('arr', arr)
