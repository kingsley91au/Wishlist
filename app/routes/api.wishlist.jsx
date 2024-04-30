import { json } from "@remix-run/node";

export async function loader() {

    return json({
        ok: true,
        message: "Hello, from the API!"
    })
}

export async function action({ request }) {
    const method = request.method;
    
    switch (method) {
        case "POST":
            //Handle POST request logic here
            //For example, adding a new item to the wishlist
            return json({ messsage: "success", method: "POST"});
        case "PATCH":
            //Handle PATCH request logic here
            //For example, updating on existing item in the wishlist
            return json({ messsage: "success", method: "PATCH"});
        default:
            //Optional: handle other method or return a method not allowed response
            return new Response("Method Not Allowed", { status: 405 });
    }
}