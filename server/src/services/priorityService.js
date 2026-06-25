function getDeadlineScore(daysLeft){
    if(daysLeft <=1 ) return 100;
    if(daysLeft <=3) return 80;
    if(daysLeft<=7) return 60;
    if(daysLeft <=14) return 40;

    return 20;

 }

 function getDifficultyScore(difficulty){
    switch(difficulty){
        case "Hard":
            return 100;
        case "Medium":
            return 60;
        case "Easy":
            return 30;
        default:
            return 0;
    }
 }
 function getProgressScore(progress){
    if(progress <=20) return 100;
    if(progress <=50) return 70;
    if(progress <=80) return 40;

    return 10;
 }
 function calculateDaysLeft(deadline){
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime= dueDate- today;

    return Math.ceil(diffTime / (1000 * 60 * 60 *24));
 }
 export function calculatePriority(item){
    const daysLeft= calculateDaysLeft(item.deadline);
    const deadlineScore= getDeadlineScore(daysLeft);
    const progressScore= getProgressScore(item.progress);
    const difficultyScore= getDifficultyScore(item.difficulty);
    const score= (deadlineScore * 0.5) + (difficultyScore *0.3)+ (progressScore * 0.2);

    return Math.round(score);
 }
 export function getPriorityLevel(score){
    if(score >=80)
        return "High";
    if(score>=50)
        return "Meduim";
    return "Low";
 }
 
