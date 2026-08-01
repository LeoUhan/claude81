/**
 * 用真实的环比变化率（trendPct）反推出一条近 N 周的趋势形状，用于可视化。
 * 不是编造的历史数据点——起点和终点由真实字段决定，中间按几何插值生成，
 * 只用来表达"变化的走势"，具体每周数值不构成独立事实。
 */
export function buildTrendSeries(trendPct: number, points = 8): number[] {
  const ratio = 1 + trendPct / 100
  const steps = points - 1
  const perStepRatio = steps > 0 ? Math.pow(Math.max(ratio, 0.05), 1 / steps) : 1
  const series: number[] = []
  for (let i = 0; i < points; i++) {
    series.push(100 * Math.pow(perStepRatio, i))
  }
  return series
}
