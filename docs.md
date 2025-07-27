# Admin API Documentation

This document describes the API endpoints available in the `admin.routes.js` file for the Publish Flow application. All endpoints are prefixed with `/admin` (assuming this router is mounted at `/admin`).

---

## 1. Get All Posts

- **Endpoint:** `GET /admin/posts`
- **Description:** Retrieves a list of all posts in the system.
- **Request Parameters:** None
- **Query Parameters:**
  - May support pagination, filtering, or sorting (see controller for details)
- **Response:**
  - `200 OK`: Array of post objects
  - `500 Internal Server Error`: On failure

---

## 2. Create a New Post

- **Endpoint:** `POST /admin/posts`
- **Description:** Creates a new post.
- **Request Body:**
  - `title` (string): Title of the post
  - `content` (string): Content/body of the post
  - `category` (string or ID): Category for the post
  - `author` (string or ID): Author of the post
  - Additional fields as required by the model
- **Response:**
  - `201 Created`: Created post object
  - `400 Bad Request`: Validation error
  - `500 Internal Server Error`: On failure

---

## 3. Get Single Post

- **Endpoint:** `GET /admin/posts/:id`
- **Description:** Retrieves details of a single post by its ID.
- **Path Parameters:**
  - `id` (string): Unique identifier of the post
- **Response:**
  - `200 OK`: Post object
  - `404 Not Found`: If post does not exist
  - `500 Internal Server Error`: On failure

---

## 4. Edit Post

- **Endpoint:** `PUT /admin/posts/:id`
- **Description:** Updates an existing post by its ID.
- **Path Parameters:**
  - `id` (string): Unique identifier of the post
- **Request Body:**
  - Fields to update (e.g., `title`, `content`, `category`, etc.)
- **Response:**
  - `200 OK`: Updated post object
  - `400 Bad Request`: Validation error
  - `404 Not Found`: If post does not exist
  - `500 Internal Server Error`: On failure

---

## 5. Delete Post

- **Endpoint:** `DELETE /admin/posts/:id`
- **Description:** Deletes a post by its ID.
- **Path Parameters:**
  - `id` (string): Unique identifier of the post
- **Response:**
  - `200 OK`: Success message or deleted post object
  - `404 Not Found`: If post does not exist
  - `500 Internal Server Error`: On failure

---

## 6. Search (All Methods)

- **Endpoint:** `ALL /admin/search`
- **Description:** Performs a search across posts, categories, or users. Accepts any HTTP method.
- **Request Parameters:**
  - Varies by method and search type (see controller for details)
- **Query Parameters:**
  - `q` (string): Search query
  - Additional filters as supported
- **Response:**
  - `200 OK`: Search results (array of objects)
  - `400 Bad Request`: Invalid query
  - `500 Internal Server Error`: On failure

---

## 7. Autocomplete

- **Endpoint:** `GET /admin/autocomplete`
- **Description:** Provides autocomplete suggestions for search queries.
- **Query Parameters:**
  - `q` (string): Partial search term
- **Response:**
  - `200 OK`: Array of suggestion strings or objects
  - `400 Bad Request`: Invalid query
  - `500 Internal Server Error`: On failure

---

## Authentication

- **Note:** The authentication middleware is present but commented out. If enabled, all routes will require authentication (e.g., JWT token in headers).

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages on failure.

---

## Example Request/Response

### Create Post

**Request:**
```http
POST /admin/posts
Content-Type: application/json
{
  "title": "New Post",
  "content": "This is the body of the post.",
  "category": "news",
  "author": "admin"
}
```

**Response:**
```http
201 Created
{
  "id": "123",
  "title": "New Post",
  "content": "This is the body of the post.",
  "category": "news",
  "author": "admin",
  ...
}
```

---

For more details, refer to the controller implementations in `Server/Controllers/admin.controller.js`.
