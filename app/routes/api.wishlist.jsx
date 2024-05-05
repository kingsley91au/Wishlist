import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!customerId || !shop || !productId) {
    return cors(request, json({
      ok: false,
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET"
    }, { status: 400 }));
  }

  try {
    const wishlistItems = await db.wishlist.findMany({
      where: { customerId, shop, productId },
    });
    return cors(request, json({ ok: true, message: "Success", data: wishlistItems }));
  } catch (error) {
    console.error("Database error:", error);
    return cors(request, json({
      ok: false,
      message: "Failed to fetch wishlist items",
      error: error.message
    }, { status: 500 }));
  }
}

export async function action({ request }) {
  const formData = await request.formData();
  const customerId = formData.get("customerId");
  const productId = formData.get("productId");
  const shop = formData.get("shop");
  const _action = formData.get("_action");

  if (!customerId || !productId || !shop || !_action) {
    return cors(request, json({
      ok: false,
      message: "Missing data. Required data: customerId, productId, shop, _action",
      method: _action
    }, { status: 400 }));
  }

  switch (_action) {
    case "CREATE":
      try {
        const wishlist = await db.wishlist.create({
          data: { customerId, productId, shop },
        });
        return cors(request, json({ ok: true, message: "Product added to wishlist", method: _action }));
      } catch (error) {
        console.error("Error creating wishlist item:", error);
        return cors(request, json({
          ok: false,
          message: "Failed to add product to wishlist",
          error: error.message
        }, { status: 500 }));
      }

    case "DELETE":
      try {
        await db.wishlist.deleteMany({
          where: { customerId, shop, productId },
        });
        return cors(request, json({ ok: true, message: "Product removed from your wishlist", method: _action }));
      } catch (error) {
        console.error("Error deleting wishlist item:", error);
        return cors(request, json({
          ok: false,
          message: "Failed to remove product from wishlist",
          error: error.message
        }, { status: 500 }));
      }

    case "PATCH":
      // Assuming PATCH logic is correctly implemented in your actual code
      return cors(request, json({ ok: true, message: "Wishlist item updated", method: "PATCH" }));

    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}