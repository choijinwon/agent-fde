import { ArrowRight, Layers3 } from "lucide-react";
import type { CaseStudyEntry } from "@/lib/case-studies";

export default function CaseDiagram({ study, compact = false }: { study: CaseStudyEntry; compact?: boolean }) {
  return <figure className={`case-diagram${compact ? " case-diagram-compact" : ""}`}>
    <div className="case-diagram-label"><Layers3 size={15} aria-hidden="true" /><span>구성 설명</span></div>
    <ol className={`case-diagram-nodes${study.diagramConnected ? " case-diagram-connected" : ""}`}>
      {study.diagram.map((item, index) => <li key={item.title}>
        <span className="case-node-number" aria-hidden="true">0{index + 1}</span>
        <strong>{item.title}</strong><span>{item.description}</span>
        {study.diagramConnected && index < study.diagram.length - 1 && <ArrowRight className="case-node-arrow" size={18} strokeWidth={1.4} aria-hidden="true" />}
      </li>)}
    </ol>
    {!compact && <figcaption>경력에 기재된 개발 범위를 설명한 도식입니다. 실제 서비스 화면과 데이터가 아닙니다.</figcaption>}
  </figure>;
}
