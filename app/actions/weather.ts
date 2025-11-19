'use server'

// Open-Meteo APIを使用して緯度経度から天気情報を取得
async function getWeatherByCoords(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,precipitation_probability&timezone=auto`,
    { next: { revalidate: 1800 } } // 30分キャッシュ
  )
  
  if (!response.ok) {
    throw new Error('天気情報の取得に失敗しました')
  }

  return response.json()
}

// Open-Meteoの天気コードを日本語に変換
function getWeatherCondition(code: number): { condition: string; description: string } {
  const weatherMap: { [key: number]: { condition: string; description: string } } = {
    0: { condition: '晴れ', description: '快晴' },
    1: { condition: '晴れ', description: 'ほぼ晴れ' },
    2: { condition: '曇り', description: '一部曇り' },
    3: { condition: '曇り', description: '曇り' },
    45: { condition: '霧', description: '霧' },
    48: { condition: '霧', description: '霧氷' },
    51: { condition: '小雨', description: '小雨' },
    53: { condition: '小雨', description: '霧雨' },
    55: { condition: '雨', description: '強い霧雨' },
    61: { condition: '雨', description: '小雨' },
    63: { condition: '雨', description: '雨' },
    65: { condition: '雨', description: '大雨' },
    71: { condition: '雪', description: '小雪' },
    73: { condition: '雪', description: '雪' },
    75: { condition: '雪', description: '大雪' },
    77: { condition: '雪', description: 'みぞれ' },
    80: { condition: '雨', description: 'にわか雨' },
    81: { condition: '雨', description: '強いにわか雨' },
    82: { condition: '雨', description: '激しいにわか雨' },
    85: { condition: '雪', description: 'にわか雪' },
    86: { condition: '雪', description: '強いにわか雪' },
    95: { condition: '雷雨', description: '雷雨' },
    96: { condition: '雷雨', description: '雷雨とひょう' },
    99: { condition: '雷雨', description: '激しい雷雨とひょう' }
  }

  return weatherMap[code] || { condition: '不明', description: '不明' }
}

// 日本語地名を英語（ローマ字）に変換するマッピング
const locationMap: { [key: string]: string } = {
  // 主要都市
  '東京': 'Tokyo',
  '大阪': 'Osaka',
  '京都': 'Kyoto',
  '名古屋': 'Nagoya',
  '札幌': 'Sapporo',
  '福岡': 'Fukuoka',
  '神戸': 'Kobe',
  '横浜': 'Yokohama',
  '仙台': 'Sendai',
  '広島': 'Hiroshima',
  '北九州': 'Kitakyushu',
  '千葉': 'Chiba',
  '川崎': 'Kawasaki',
  '静岡': 'Shizuoka',
  '岡山': 'Okayama',
  '熊本': 'Kumamoto',
  '鹿児島': 'Kagoshima',
  '那覇': 'Naha',
  '新潟': 'Niigata',
  '金沢': 'Kanazawa',
  '長野': 'Nagano',
  '富山': 'Toyama',
  '奈良': 'Nara',
  '和歌山': 'Wakayama',
  '松山': 'Matsuyama',
  '高松': 'Takamatsu',
  '沖縄': 'Okinawa',
}

// 日本語地名を英語に変換
function convertLocationToEnglish(location: string): string {
  // 既に英語の場合はそのまま返す
  if (!/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(location)) {
    return location
  }
  
  // マッピングに存在する場合は変換
  return locationMap[location] || location
}

// 地名から緯度経度を取得（Open-Meteo Geocoding API）
async function getCoordinates(location: string) {
  const englishLocation = convertLocationToEnglish(location)
  
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(englishLocation)}&count=1&language=ja&format=json`,
    { next: { revalidate: 86400 } } // 24時間キャッシュ
  )
  
  if (!response.ok) {
    throw new Error('位置情報の取得に失敗しました')
  }

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    throw new Error('指定された地域が見つかりませんでした')
  }

  return {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
    name: data.results[0].name
  }
}

export async function fetchWeatherData(location: string) {
  try {
    // 地名から緯度経度を取得
    const coords = await getCoordinates(location)
    
    // 天気情報を取得
    const weatherData = await getWeatherByCoords(coords.lat, coords.lon)
    
    const { condition, description } = getWeatherCondition(weatherData.current.weather_code)
    
    return {
      temp: Math.round(weatherData.current.temperature_2m),
      condition,
      description: `${coords.name}の${description}`,
      precipitation: weatherData.current.precipitation_probability || 0
    }
  } catch (error) {
    console.error('天気情報の取得エラー:', error)
    return {
      temp: 22,
      condition: 'エラー',
      description: '天気情報を取得できませんでした',
      precipitation: 0
    }
  }
}
