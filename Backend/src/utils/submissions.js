import { SubmissionStatusEnum } from "../utils/constants.js";

export const calculateSubmissionStatus = ({
  detailedResults,
  allPassed,
}) => {
  if (detailedResults.some(r => r.compile_output)) {
    return SubmissionStatusEnum.COMPILATION_ERROR;
  }

  if (detailedResults.some(r => r.stderr)) {
    return SubmissionStatusEnum.RUNTIME_ERROR;
  }

  if (!allPassed) {
    return SubmissionStatusEnum.WRONG_ANSWER;
  }

  return SubmissionStatusEnum.ACCEPTED;
};
