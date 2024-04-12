/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// ?action=av-bv&value=0

// 添加事件监听器來處理請求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 算法來源 https://www.zhihu.com/question/381784377/answer/1099438784

// 固定值用於解碼和編碼
const xorn = 177451812;
const add = 8728348608;
// 用於編碼和解碼的索引陣列
const s = [11, 10, 3, 8, 4, 6];
// 對應關係表
const TABLE = "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
const tr = {};
for (let i = 0; i < 58; i++) {
  tr[TABLE[i]] = i;
}

// 解碼函數 BV
function dec(x) {
  let r = 0;
  for (let i = 0; i < 6; i++) {
    r += Math.pow(58, i) * tr[x[s[i]]];
  }
  return (r - add) ^ xorn;
}

// 編碼函數 AV
function enc(x) {
  x = (x ^ xorn) + add;
  let r = "BV1  4 1 7  ";
  for (let i = 0; i < 6; i++) {
    r = r.substring(0, s[i]) + TABLE[Math.floor(x / Math.pow(58, i)) % 58] + r.substring(s[i] + 1);
  }
  return r;
}

// 處理請求的函數
async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const url = new URL(request.url);
  const params = url.searchParams;
  const operation = params.get("action"); // 獲取操作類型
  const value = params.get("value"); // 獲取值

  try {
    if (operation === "av-bv") {
      // 如果操作是 AV 轉 BV 號
      const av = parseInt(value);
      const bv = enc(av);
      const responseObj = {
        code: 200,
        msg: "success",
        action: "AV-BV",
        time: Date.now(),
        data: {
          result: bv,
          original: av
       }
      };
      // 返回 JSON 格式的響應
      return new Response(JSON.stringify(responseObj), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } else if (operation === "bv-av") {
      // 如果操作是 BV 號轉 AV 號
      const bv = value.toUpperCase().trim();
      const av = dec(bv);
      const responseObj = {
        code: 200,
        msg: "success",
        action: "BV-AV",
        time: Date.now(),
        data: {
          result: av,
          original: bv
        }
      };
      // 返回 JSON 格式的響應
      return new Response(JSON.stringify(responseObj), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } else {
      // 如果操作不合法，拋出錯誤
      throw new Error("無效的操作。");
    }
  } catch (err) {
    // 捕獲錯誤，返回錯誤信息
    const errorObj = {
      code: 400,
      msg: err.message,
      timestamp: new Date().toISOString()
    };
    // 返回 JSON 格式的錯誤響應
    return new Response(JSON.stringify(errorObj), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}
