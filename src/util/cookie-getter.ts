import { env } from "../env";

//Here, i will log in to Divisist, use my credentials and automatically get the cookie
class CookieGetter {
    private cookie: string = "";

    public async getCookie() {
        if (this.cookie !== "") {
            return this.cookie;
        }

        //return this.cookie;

        //While making automation
        const endpoint = "/cookie"

        const response = await fetch(`${env.COOKIE_GETTER_URL}${endpoint}`, {
            method: "GET"
        })
        const data = await response.json();
        if(data.error){
            throw Error (`Error getting cookie: ${data.msg}`)
        }
        this.cookie = data.cookie;
        return this.cookie;
    }

    public setCookie(cookie: string) {
        this.cookie = cookie;
    }
}

export const cookieGetter = new CookieGetter;
export default cookieGetter;