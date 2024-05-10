import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from 'remix-utils/cors';

// GET request: accept request with customerId, optionally customerName, shop, and productId.
export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const customerName = url.searchParams.get("customerName");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");
  const productName = url.searchParams.get("productName");

  // Ensure customerId is present
  if (!customerId) {
    return json({
      message: "Missing data. Required data: customerId",
      method: "GET"
    }, { status: 400 });
  }

  // Build the query filter based on provided parameters
  const whereClause = { customerId };
  if (customerName) {
    whereClause.customerName = customerName;
  }
  if (shop) {
    whereClause.shop = shop;
  }
  if (productId) {
    whereClause.productId = productId;
  }
  if (productName) {
    whereClause.productName = productName;
  }

  // Fetch wishlist items from the database
  const wishlist = await db.wishlist.findMany({
    where: whereClause,
  });

  const response = json({
    ok: true,
    message: "Success",
    data: wishlist,
  });

  return cors(request, response);
}

// POST/PATCH/DELETE request: Process wishlist items based on the specified _action.
export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);
  const customerId = data.customerId;
  const customerName = data.customerName;
  const productId = data.productId;
  const productName = data.productName;
  const shop = data.shop;
  const _action = data._action;

  if (!customerId || !customerName || !productId || !productName || !shop || !_action) {
    return json({
      message: "Missing data. Required data: customerId, customerName, productId, shop, _action",
      method: _action
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the wishlist
      const wishlist = await db.wishlist.create({
        data: {
          customerId,
          customerName,
          productId,
          productName,
          shop,
        },
      });

      response = json({
        message: "Product added to wishlist",
        method: _action,
        wishlisted: true,
      });
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the wishlist
      return json({ message: "Success", method: "Patch" });

    case "DELETE":
      // Handle DELETE request logic here
      // For example, removing an item from the wishlist
      await db.wishlist.deleteMany({
        where: {
          customerId: customerId,
          customerName: customerName,
          shop: shop,
          productId: productId,
          productName: productName,
        },
      });

      response = json({
        message: "Product removed from your wishlist",
        method: _action,
        wishlisted: false,
      });
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }
}
