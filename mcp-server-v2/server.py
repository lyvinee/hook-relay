import httpx
from fastmcp import FastMCP

API_BASE_URL = "http://localhost:5000"
SWAGGER_JSON_URL = f"{API_BASE_URL}/swagger/json"

def create_server():
    # Create an HTTP client for your API
    # Note: verify=False is used here for local development if HTTPS were involved, 
    # but for localhost http it's fine.
    client = httpx.AsyncClient(base_url=API_BASE_URL)

    try:
        # Load OpenAPI spec
        print(f"Fetching OpenAPI spec from {SWAGGER_JSON_URL}...")
        response = httpx.get(SWAGGER_JSON_URL)
        response.raise_for_status()
        openapi_spec = response.json()
    except Exception as e:
        print(f"Error fetching OpenAPI spec: {e}")
        # Return a dummy server or exit, but FastMCP might need the spec immediately.
        # For this script, we'll let it fail if the backend isn't up, 
        # as it's a dynamic server.
        raise e

    # Create the MCP server
    mcp = FastMCP.from_openapi(
        openapi_spec=openapi_spec,
        client=client,
        name="Hook Relay API (v2)"
    )
    
    return mcp

if __name__ == "__main__":
    try:
        mcp = create_server()
        print("Starting MCP server...")
        mcp.run()
    except Exception as e:
        print(f"Failed to start server: {e}")
