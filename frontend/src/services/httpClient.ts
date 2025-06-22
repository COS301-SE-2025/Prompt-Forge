const HttpClient = {
    apiUrl : 'http://localhost:8080',
    async get(endpoint:string) {
        return await fetch(`${this.apiUrl}${endpoint}`);
    },
    
    async post(endpoint:string, body:Object) {
        return await fetch(`${this.apiUrl}${endpoint}`,{
            method:'POST',
            body:JSON.stringify(body),
            headers:{
                'Content-Type':'application/json'
            }
        });
    }
}

export default HttpClient;