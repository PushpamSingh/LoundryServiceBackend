const obj={
    "key1":1,
    "key2":2,
    "key3":3
}
let sum=Object.values(obj).reduce((acc,curr)=>acc+curr,0)
// for(const key in obj){
//     sum+=obj[key]
// }
console.log(sum);
