"use client";

import StarRating from "./StarRating";

export interface KPIData {
  id: number;
  name: string;
  code: string;
  description: string;
  behaviors?: string[];
}

interface KPIRowProps {
  index: number;
  kpi: KPIData;
  score: number;
  onScoreChange: (kpiId: number, score: number) => void;
  maxScore?: number;
  readOnly?: boolean;
}

export default function KPIRow({
  index,
  kpi,
  score,
  onScoreChange,
  maxScore = 6,
  readOnly = false,
}: KPIRowProps) {
  return (
    <section className="bg-white rounded-xl shadow p-6 space-y-4">
      {/* TABLE HEADER (Desktop) */}
      <div className="hidden md:grid grid-cols-12 font-bold text-[#0b2f63]">
        <div className="col-span-1">No</div>
        <div className="col-span-3">Indicator</div>
        <div className="col-span-6">Definition</div>
        <div className="col-span-2">Score</div>
      </div>

      {/* ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-[#0b2f63]">
        <div className="md:col-span-1 font-semibold">{index + 1}</div>

        <div className="md:col-span-3 font-medium">{kpi.name}</div>

        <div className="md:col-span-6 text-sm space-y-2">
          <p>{kpi.description}</p>

          {kpi.behaviors && kpi.behaviors.length > 0 && (
            <ul className="list-disc ml-5">
              {kpi.behaviors.map((behavior, i) => (
                <li key={i}>{behavior}</li>
              ))}
            </ul>
          )}
        </div>

        {/* SCORE */}
        <div className="md:col-span-2">
          <StarRating
            value={score}
            onChange={(value) => onScoreChange(kpi.id, value)}
            maxRating={maxScore}
            readOnly={readOnly}
          />
        </div>
      </div>
    </section>
  );
}
