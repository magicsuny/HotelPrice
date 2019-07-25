//数1
function count(n) {
    let c = 0;
    while (n) {
        console.log('f:', n.toString(2));
        n &= (n - 1);
        console.log('a', n.toString(2));
        c++;
    }
    return c;
}

//爬梯子
function climb(n) {
    if (n === 1) {
        return 1;
    }
    let dp = new Array(n + 1);
    dp[1] = 1;
    dp[2] = 2;
    dp[3] = 4;
    for (let i = 3; i < dp.length; i++) {
        dp[i] = dp[i - 1] + dp[i - 2] + dp[i - 3];
    }
    return dp[n];
}

//parseInt
function parseInt(str, radix = 10) {
    let result = 0;
    let isNegative = false;
    if (typeof str !== 'string' && typeof str !== 'number') {
        // 如果类型不是 string 或 number 类型返回NaN
        return NaN
    }
    // 字符串处理
    str = String(str).trim().split('.')[0];
    let firstChar = str.charAt(0);
    if (firstChar < '0') {
        str = str.slice(1);
        if (firstChar === '-') {
            isNegative = true;
        } else if (firstChar !== '+') {
            return NaN;
        }
    }
    let length = str.length;
    if (!length) {
        // 如果为空则返回 NaN
        return NaN
    }
    if (typeof radix !== 'number' || radix < 2 || radix > 36) {
        return NaN
    }

    for (let i = 0; i < length; i++) {
        let c = str.charCodeAt(i);
        if (c >= 97) {
            c -= 87;    // - 'a' + 10
        } else if (c >= 65) {
            c -= 55;    // - 'A' + 10
        } else {
            c -= 48;    // - '0'
        }
        if (c >= radix) {
            return NaN;
        }
        result = (result * radix) + c;
    }
    if (isNegative) {
        result *= -1;
    }

    return result;
}

//打印素数
function printPrime(n) {
    let result = [2];
    for (let i = 3; i <= n; i += 2) {
        let isPrime = true;
        for (let j = 2; j < i; j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) result.push(i);
    }
    console.log(result);
}

//printPrime(1000);


