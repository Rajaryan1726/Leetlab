import {
  CheckCircle2,
  XCircle,
  Clock,
  MemoryStick as Memory,
  Calendar,
  FileCode2,
} from "lucide-react";

const SubmissionsList = ({ submissions, isLoading }) => {
  // ✅ SAFELY parse memory/time data
  const safeParse = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  };

  // ✅ Average Memory
  const calculateAverageMemory = (memoryData) => {
    const arr = safeParse(memoryData);
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const nums = arr.map((m) => parseFloat(m));
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  // ✅ Average Time
  const calculateAverageTime = (timeData) => {
    const arr = safeParse(timeData);
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const nums = arr.map((t) => parseFloat(t));
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  // 🔄 Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  // 📭 No submissions
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/40">
        <FileCode2 className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No submissions yet</p>
        <p className="text-xs mt-1">Submit your solution to see results here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {submissions.map((submission, index) => {
        const avgMemory = calculateAverageMemory(submission.memory);
        const avgTime = calculateAverageTime(submission.time);
        const isAccepted = submission.status === "Accepted";

        return (
          <div
            key={submission._id}
            className={`rounded-lg border transition-all duration-150 hover:shadow-md cursor-default ${isAccepted
                ? "border-l-4 border-l-success border-success/20 bg-success/5 hover:bg-success/10"
                : "border-l-4 border-l-error border-error/20 bg-error/5 hover:bg-error/10"
              }`}
          >
            <div className="px-4 py-3">
              {/* Top Row: Status + Language */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  {isAccepted ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm font-semibold text-success">Accepted</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-error" />
                      <span className="text-sm font-semibold text-error">
                        {submission.status}
                      </span>
                    </div>
                  )}
                  <div className="badge badge-ghost badge-sm text-xs font-medium">
                    {submission.language}
                  </div>
                </div>
                <span className="text-xs text-base-content/40 font-mono">
                  #{submissions.length - index}
                </span>
              </div>

              {/* Bottom Row: Metrics */}
              <div className="flex items-center gap-4 text-xs text-base-content/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{avgTime.toFixed(3)}s</span>
                </div>
                <div className="flex items-center gap-1">
                  <Memory className="w-3.5 h-3.5" />
                  <span>{avgMemory.toFixed(0)} KB</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(submission.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubmissionsList;
