/// <reference types="vite/client" />

interface Window {
  trainerApi?: {
    getCourse(): Promise<import("./domain/types").PublicCourse>;
    checkAnswer(request: import("./domain/types").CheckRequest): Promise<import("./domain/types").CheckResult>;
  };
}
