import {
  calculatePriority,
  getPriorityLevel
} from "./src/services/priorityService.js";

const item = {
  deadline: "2026-07-01",
  difficulty: "Hard",
  progress: 20
};

const score = calculatePriority(item);
const level = getPriorityLevel(score);

console.log("Score:", score);
console.log("Level:", level);
