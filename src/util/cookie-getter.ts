

//Here, i will log in to Divisist, use my credentials and automatically get the cookie
class CookieGetter {
    private cookie: string = "";

    public getCookie(){
        return this.cookie;
    }

    public setCookie(cookie: string){
        this.cookie = cookie;
    }
}

export const cookieGetter = new CookieGetter;
export default cookieGetter;