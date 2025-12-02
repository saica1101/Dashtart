'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Cloud, Settings } from 'lucide-react'
import { fetchWeatherData } from '@/lib/weather'

type WeatherData = {
  temp: number
  condition: string
  description: string
  precipitation: number
}

interface WeatherWidgetProps {
  isStreaming: boolean
}

export function WeatherWidget({ isStreaming }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: '晴れ', description: '読み込み中...', precipitation: 0 })
  const [weatherLocation, setWeatherLocation] = useState('東京')
  const [showWeatherSettings, setShowWeatherSettings] = useState(false)
  const [tempWeatherLocation, setTempWeatherLocation] = useState('東京')
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWeatherLocation = localStorage.getItem('weatherLocation')
      if (savedWeatherLocation) setWeatherLocation(savedWeatherLocation)
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('weatherLocation', weatherLocation)
    }
  }, [weatherLocation, isHydrated])

  const fetchWeather = async (location: string) => {
    setIsLoadingWeather(true)
    try {
      const weatherData = await fetchWeatherData(location)
      setWeather(weatherData)
    } catch (error) {
      console.error('天気情報の取得エラー:', error)
      setWeather({
        temp: 22,
        condition: 'エラー',
        description: '天気情報を取得できませんでした',
        precipitation: 0
      })
    } finally {
      setIsLoadingWeather(false)
    }
  }

  useEffect(() => {
    fetchWeather(weatherLocation)
  }, [weatherLocation])

  const saveWeatherLocation = () => {
    setWeatherLocation(tempWeatherLocation)
    setShowWeatherSettings(false)
    fetchWeather(tempWeatherLocation)
  }


  if (isStreaming) return null

  return (
    <div className="w-full px-4 mb-4">
      <Card className="p-4 w-full bg-card/50 backdrop-blur relative group border-border/50">
        {isLoadingWeather ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[2rem_1fr] gap-3 items-center">
              <div className="flex items-center justify-center">
                <Cloud className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold leading-none">{weather.temp}°C</div>
                <div className="text-sm text-muted-foreground">{weather.condition}</div>
              </div>

              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cloud-rain text-blue-500" viewBox="0 0 16 16">
                  <path d="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 0 1-.948-.316l1-3a.5.5 0 0 1 .632-.317m3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317m3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 1 1-.948-.316l1-3a.5.5 0 0 1 .632-.317m.247-6.998a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973M8.5 2a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4 4 0 0 1 8.5 2"/>
                </svg>
              </div>
              <div className="text-sm text-muted-foreground">{weather.precipitation}%</div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground pl-1">{weatherLocation}</div>
          </>
        )}
        
        {/* 設定ボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            setTempWeatherLocation(weatherLocation)
            setShowWeatherSettings(!showWeatherSettings)
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* 設定パネル */}
        {showWeatherSettings && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
            <h3 className="text-sm font-semibold mb-3">地域設定</h3>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="地域名を入力 (例: 東京, Tokyo, Osaka)"
                value={tempWeatherLocation}
                onChange={(e) => setTempWeatherLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveWeatherLocation()}
              />
              <div className="text-xs text-muted-foreground">
                ※ 日本語または英語で都市名を入力してください
              </div>
              <div className="flex gap-2">
                <Button onClick={saveWeatherLocation} size="sm" className="flex-1">
                  保存
                </Button>
                <Button 
                  onClick={() => setShowWeatherSettings(false)} 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
