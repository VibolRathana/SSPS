function getDeadlineScore(daysLeft){
    if(daysLeft <=1) return  100;
    if(daysLeft <=3) return 80;
    if(daysLeft <=7) return 60;
    if(daysLeft <=14)return 40;
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
            return 20;
    }
}
function getProgressScore(progress){
    if(progress <=20) return 100;
    if(progress <=50) return 70;
    if(progress <=80) return 40;
    return 10;
}

export function calculatePriority(item){
    const today= new Date();
    const dueDate= new Date(item.due_date || item.exam_date);
    const diffTime= dueDate-today;
    const daysLeft= Math.ceil( diffTime / (1000 * 60 * 60 *24));
    const deadlineScore= getDeadlineScore(daysLeft);
    const difficultyScore= getDifficultyScore(item.difficulty||"Medium");
    const progressScore= getProgressScore(item.progress ?? item.preparation ?? 0);
    const score = (deadlineScore*0.5) + (difficultyScore *0.3) + (progressScore * 0.2);
    return Math.round(score);
}
export function getPriorityLevel(score){
    if(score >=80)
        return "High";
    if(score >=50)
        return "Medium";
    return "Low";
}