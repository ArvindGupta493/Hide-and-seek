const yourScore = 15;
const otherScores = [15, 5, 45, 70, 32, 56, 12, 25, 65,5,756,5,4,8,1,47,7,5,3,4];

const allScores = [...otherScores, yourScore]
const lowerThanYourScore = allScores.filter(score => score < yourScore).length;
const totalParticipants = allScores.length;
const percentageLower = (lowerThanYourScore / totalParticipants) * 100;
console.log(`Percentage: ${percentageLower.toFixed(2)}%`);


let res = 0
const sortedArr = otherScores.sort((a, b)=>( b - a ))
for(let i = 0; i < sortedArr.length; i++){
    if(sortedArr[i] <= yourScore){
        res = ((sortedArr.length - i )/sortedArr.length)* 100
        break
    }
}
console.log(`Percentage: ${res.toFixed(2)}%`);
