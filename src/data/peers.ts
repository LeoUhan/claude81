export interface PeerBenchmark {
  industry: string
  peerName: string
  certifications: string[]
  caseStudyCount: number
  note: string
}

/**
 * 同行业对标样例数据。比赛原型阶段用构造样例代替真实抓取结果，
 * 对比与信号生成逻辑是真实运行的，正式产品需替换为授权的定时抓取连接器（见 PRD 12.3 连接器替换原则）。
 */
export const peerBenchmarks: PeerBenchmark[] = [
  { industry: '流体设备', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证', 'API 610'], caseStudyCount: 6, note: '参考同类出口型企业公开产品页整理' },
  { industry: '精密机械', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 5, note: '参考同类精密制造企业公开产品页整理' },
  { industry: '工业阀门', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证', 'API 6D'], caseStudyCount: 6, note: '参考同类阀门制造企业公开产品页整理' },
  { industry: '工业电机', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 5, note: '参考同类电机供应企业公开产品页整理' },
  { industry: '电子元件', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'IATF 16949'], caseStudyCount: 7, note: '参考同类电子元件出口企业公开产品页整理' },
  { industry: '包装设备', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 5, note: '参考同类包装设备企业公开产品页整理' },
  { industry: '水处理', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 6, note: '参考同类水处理工程企业公开产品页整理' },
  { industry: '轴承零部件', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 5, note: '参考同类轴承制造企业公开产品页整理' },
  { industry: '自动化设备', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 7, note: '参考同类自动化集成企业公开产品页整理' },
  { industry: '农机配件', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001'], caseStudyCount: 5, note: '参考同类农机配件企业公开产品页整理' },
  { industry: '机床配套', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'CE认证'], caseStudyCount: 5, note: '参考同类机床配套企业公开产品页整理' },
  { industry: '新材料', peerName: '同行业头部厂商（样例对标）', certifications: ['ISO 9001', 'ROHS认证'], caseStudyCount: 6, note: '参考同类新材料加工企业公开产品页整理' },
]
