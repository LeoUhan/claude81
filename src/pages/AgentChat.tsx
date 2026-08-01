import Topbar from '../components/Topbar'
import AgentThread from '../components/AgentThread'

export default function AgentChat() {
  return (
    <div className="flex h-screen flex-col">
      <Topbar title="Agent 对话" subtitle="与 Value-Guard Agent 对话，识别风险、生成动作、一键推进" />
      <div className="min-h-0 flex-1">
        <AgentThread />
      </div>
    </div>
  )
}
