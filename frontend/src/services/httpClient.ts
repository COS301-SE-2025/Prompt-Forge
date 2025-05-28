class HttpClient {
    async get(url:string) {
        return await fetch(url);
    }
    
    async post(url:string, body:Object) {
        return await fetch(url,{
            method:'POST',
            body:JSON.stringify(body),
            headers:{
                'Content-Type':'application/json'
            }
        });
    }
}

export default HttpClient;