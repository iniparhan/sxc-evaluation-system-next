"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  maxRating?: number;
  readOnly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  maxRating = 6,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`w-10 h-10 rounded-full font-bold text-sm transition ${
            value >= star
              ? "bg-[#0b2f63] text-white"
              : "bg-gray-200 text-[#0b2f63] hover:bg-[#0b2f63] hover:text-white"
          } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          {star}
        </button>
      ))}
    </div>
  );
}
