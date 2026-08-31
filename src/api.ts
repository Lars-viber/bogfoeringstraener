import type { CheckRequest, CheckResult, PublicCourse } from "./domain/types";
import publicCourseData from "./data/public-course.json";
import courseSolutions from "../shared/course-solutions.json";
import { getStuckHint, validateAnswer } from "../shared/validation.mjs";

const solutions = new Map(
  courseSolutions.solutions.map((solution) => [solution.voucherId, solution]),
);

export async function getCourse(): Promise<PublicCourse> {
  if (window.trainerApi) return window.trainerApi.getCourse();
  return publicCourseData as PublicCourse;
}

export async function checkAnswer(request: CheckRequest): Promise<CheckResult> {
  if (window.trainerApi) return window.trainerApi.checkAnswer(request);
  const solution = solutions.get(request.voucherId);
  if (!solution) throw new Error("Ukendt bilag.");
  if (request.requestHelp) {
    return {
      correct: false,
      balanced: false,
      message: "Her er et mere konkret spor:",
      hint: getStuckHint(solution),
      canAskForHelp: true,
    };
  }
  return validateAnswer(solution, request.entries, request.attempt);
}
