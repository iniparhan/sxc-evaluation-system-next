"use client";

interface EvaluateeCardProps {
  id: number;
  name: string;
  role: string;
  division: string;
  subDivision: string;
  isSubmitted: boolean;
  hasDraft?: boolean;
  evaluationId: number | null;
  onEvaluate: (evaluateeId: number, evaluationId: number | null) => void;
}

export default function EvaluateeCard({
  id,
  name,
  role,
  division,
  subDivision,
  isSubmitted,
  hasDraft,
  evaluationId,
  onEvaluate,
}: EvaluateeCardProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl shadow-md transition ${
        isSubmitted ? "bg-gray-300/70" : "bg-white"
      }`}
    >
      {/* LEFT - User Info */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-[70px] h-[70px] rounded-md bg-[#083577]/20 flex items-center justify-center flex-shrink-0">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#083577]"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <p className="font-bold text-[#0b2f63] text-lg">{name}</p>
          <p className="text-sm text-[#0b2f63]">{role}</p>
          <p className="text-sm text-[#0b2f63]">{subDivision}</p>
          <p className="text-sm font-bold text-[#0b2f63]">{division}</p>
          {hasDraft && !isSubmitted && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Draft saved
            </span>
          )}
        </div>
      </div>

      {/* RIGHT - Action Button */}
      <button
        className="w-full md:w-[150px] h-[45px] rounded-xl font-bold transition cursor-pointer"
        style={{
          background: isSubmitted ? "#cdcdcd" : "#083577",
          color: isSubmitted ? "#051f46" : "#ffffff",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEvaluate(id, evaluationId);
        }}
      >
        {isSubmitted ? "Edit" : "Evaluate"}
      </button>
    </div>
  );
}
