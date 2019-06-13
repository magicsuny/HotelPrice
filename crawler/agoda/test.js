function t(s) {
    return new Promise((resolve,reject)=>{
        setTimeout(async ()=>{
            console.log(s);
            resolve(s);
        },s);
    })

}

(async ()=>{
    let s = [3000,1000,2000];
    s.forEach(async (f)=>{
        let s = await t(f);
        console.log(s);
    })
})();