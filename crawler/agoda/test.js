const UserAgent = require('user-agents');

const userAgent = new UserAgent({ deviceCategory: 'tablet' });
const userAgents = Array(10).fill().map(() => new UserAgent({ deviceCategory: 'tablet' }).random() );

userAgents.forEach((u)=>{
    console.log(u.toString());
})