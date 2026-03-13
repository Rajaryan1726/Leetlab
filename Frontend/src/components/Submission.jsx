import React from 'react';
import { CheckCircle2, XCircle, Clock, MemoryStick as Memory } from 'lucide-react';

const SubmissionResults = ({ submission }) => {
  if (!submission || !Array.isArray(submission.testCases)) {
    return null;
  }

  const memoryArr = JSON.parse(submission.memory || '[]');
  const timeArr = JSON.parse(submission.time || '[]');

  const avgMemory = memoryArr.length
    ? memoryArr.map(m => parseFloat(m)).reduce((a, b) => a + b, 0) / memoryArr.length
    : 0;

  const avgTime = timeArr.length
    ? timeArr.map(t => parseFloat(t)).reduce((a, b) => a + b, 0) / timeArr.length
    : 0;

  const passedTests = submission.testCases.filter(tc => tc.passed).length;
  const totalTests = submission.testCases.length;
  const successRate = (passedTests / totalTests) * 100;

  return (
    <div className="space-y-5">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</p>
          {submission.status === 'Accepted' ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-sm font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full px-3 py-1 text-sm font-semibold">
              <XCircle className="w-3.5 h-3.5" /> {submission.status}
            </span>
          )}
        </div>

        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Success Rate</p>
          <p className="text-lg font-bold text-white">{successRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Runtime
          </p>
          <p className="text-lg font-bold text-white">{avgTime.toFixed(3)} s</p>
        </div>

        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Memory className="w-3 h-3" /> Memory
          </p>
          <p className="text-lg font-bold text-white">{avgMemory.toFixed(0)} KB</p>
        </div>
      </div>

      {/* Test Cases Table */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-gray-300">
          Test Cases
          <span className="text-xs font-normal text-gray-500 ml-2">
            ({passedTests}/{totalTests} passed)
          </span>
        </h3>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">#</th>
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">Status</th>
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">Expected</th>
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">Output</th>
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">Memory</th>
                <th className="text-gray-500 text-xs uppercase tracking-widest font-medium px-4 py-2.5 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {submission.testCases.map((testCase, index) => (
                <tr key={testCase._id || testCase.id || index} className="border-b border-white/5 odd:bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                  <td className="font-mono text-xs text-gray-500 px-4 py-2.5">{index + 1}</td>
                  <td className="px-4 py-2.5">
                    {testCase.passed ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {!testCase.stdout && !testCase.passed && (
                      <span className="text-red-400/70 text-[11px] mt-1 block">
                        No output
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-xs text-gray-300 px-4 py-2.5">{testCase.expected}</td>
                  <td className="font-mono text-xs text-gray-300 px-4 py-2.5">{testCase.stdout || <span className="text-gray-600">null</span>}</td>
                  <td className="text-xs text-gray-400 px-4 py-2.5">{testCase.memory}</td>
                  <td className="text-xs text-gray-400 px-4 py-2.5">{testCase.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResults;