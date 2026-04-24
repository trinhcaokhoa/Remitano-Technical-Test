"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function VideosPage() {
  const [url, setUrl] = useState("");
  const [showInput, setShowInput] = useState(false);

  const utils = api.useUtils();

  const { data: videos, isLoading } = api.video.getAll.useQuery();

  const shareMutation = api.video.create.useMutation({
    onSuccess: () => {
      setUrl("");
      setShowInput(false);
      void utils.video.getAll.invalidate();
    },
  });

  const isSharing = shareMutation.status === "loading";

  return (
    <main className="min-h-screen bg-gray-950 p-6 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🎥 Shared Videos</h1>

          <button
            onClick={() => setShowInput(!showInput)}
            className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
          >
            Share Video
          </button>
        </div>

        {/* Share Input */}
        {showInput && (
          <div className="flex gap-2 rounded-xl bg-gray-800 p-4">
            <input
              type="text"
              placeholder="Paste YouTube link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded bg-gray-700 p-2 outline-none"
            />

            <button
              onClick={() => shareMutation.mutate({ url })}
              disabled={shareMutation.isLoading}
              className="rounded bg-green-500 px-4 hover:bg-green-600 disabled:opacity-50"
            >
              {shareMutation.isLoading ? "Sharing..." : "Submit"}
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && <p>Loading videos...</p>}

        {/* Empty state */}
        {!isLoading && videos?.length === 0 && (
          <p className="text-gray-400">No videos shared yet.</p>
        )}

        {/* Video List */}
        <div className="flex flex-col gap-4">
          {videos?.map((video) => (
            <div key={video.id} className="rounded-xl bg-gray-800 p-4 shadow">
              <p className="text-lg font-bold">{video.title}</p>

              <p className="text-sm text-gray-400">
                Shared by {video.user.email}
              </p>

              <iframe
                className="mt-3 w-full rounded"
                height="300"
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
