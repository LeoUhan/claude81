export type RiskLevel = '高风险' | '预警' | '稳定'

export interface Customer {
  id: string
  name: string
  industry: string
  region: string
  owner: string
  health: number
  status: RiskLevel
  daysToRenewal: number
  trend: 'down' | 'flat' | 'up'
  headline: string
}

export const customers: Customer[] = [
  { id: 'A', name: 'A 潜水泵出口业务', industry: '流体设备', region: '东南亚', owner: 'CSM-001', health: 42, status: '高风险', daysToRenewal: 68, trend: 'down', headline: '45 天未登录，产品页长期未更新' },
  { id: 'B', name: 'B 精密机械制造', industry: '精密机械', region: '华东', owner: 'CSM-002', health: 58, status: '预警', daysToRenewal: 39, trend: 'down', headline: '访问量连续下降，尚未触达' },
  { id: 'C', name: 'C 工业阀门工厂', industry: '工业阀门', region: '华南', owner: 'CSM-001', health: 81, status: '稳定', daysToRenewal: 116, trend: 'up', headline: '询盘稳定，具备持续价值证明素材' },
  { id: 'D', name: 'D 工业电机供应商', industry: '工业电机', region: '华北', owner: 'CSM-003', health: 64, status: '预警', daysToRenewal: 22, trend: 'flat', headline: '续费窗口临近，健康度中等' },
  { id: 'E', name: 'E 电子元件出口商', industry: '电子元件', region: '华东', owner: 'CSM-002', health: 37, status: '高风险', daysToRenewal: 18, trend: 'down', headline: '询盘入口异常，连续 4 周无有效询盘' },
  { id: 'F', name: 'F 包装设备制造商', industry: '包装设备', region: '华南', owner: 'CSM-003', health: 77, status: '预警', daysToRenewal: 47, trend: 'flat', headline: '整体平稳，个别页面待更新' },
  { id: 'G', name: 'G 水处理工程公司', industry: '水处理', region: '西南', owner: 'CSM-001', health: 49, status: '高风险', daysToRenewal: 83, trend: 'down', headline: '页面长期未更新，流量持续下降' },
  { id: 'H', name: 'H 轴承零部件工厂', industry: '轴承零部件', region: '华东', owner: 'CSM-002', health: 69, status: '预警', daysToRenewal: 135, trend: 'up', headline: '表现回暖，建议巩固' },
  { id: 'I', name: 'I 自动化设备集成商', industry: '自动化设备', region: '华北', owner: 'CSM-003', health: 88, status: '稳定', daysToRenewal: 174, trend: 'up', headline: '高健康度，适合沉淀价值案例' },
  { id: 'J', name: 'J 农机配件厂', industry: '农机配件', region: '东北', owner: 'CSM-001', health: 55, status: '预警', daysToRenewal: 72, trend: 'flat', headline: '中等风险，观察中' },
  { id: 'K', name: 'K 机床配套供应商', industry: '机床配套', region: '华南', owner: 'CSM-002', health: 74, status: '预警', daysToRenewal: 28, trend: 'flat', headline: '续费临近，健康度良好' },
  { id: 'L', name: 'L 新材料加工企业', industry: '新材料', region: '华中', owner: 'CSM-003', health: 46, status: '高风险', daysToRenewal: 105, trend: 'down', headline: '连续多周期恶化，需人工介入' },
]

export const riskLevelStyle: Record<RiskLevel, { text: string; bg: string; dot: string }> = {
  高风险: { text: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  预警: { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  稳定: { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
}
