// This is a placeholder route. The actual Socket.io server runs as a separate process.
// See socket.ts in the root server directory for the Socket.io server implementation.

export async function GET() {
  return new Response(
    "Socket.io server is running separately. Connect via WebSocket.",
    { status: 200 },
  );
}

export async function POST() {
  return new Response("Socket.io server is running separately.", {
    status: 200,
  });
}
