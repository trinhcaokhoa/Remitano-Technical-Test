"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import Headbar from "~/app/_components/Headbar";

export default function VideosPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const utils = api.useUtils();

  const { data: videos, isPending: isLoadingVideos } =
    api.video.getAll.useQuery();

  const createVideo = api.video.create.useMutation({
    onSuccess: () => {
      setVideoUrl("");
      setDescription("");
      setIsFormOpen(false);
      void utils.video.getAll.invalidate();
    },
  });

  const upvote = api.vote.upvote.useMutation({
    onSuccess: () => void utils.video.getAll.invalidate(),
  });

  const downvote = api.vote.downvote.useMutation({
    onSuccess: () => void utils.video.getAll.invalidate(),
  });

  const isSubmitting = createVideo.isPending;

  const handleShare = () => {
    if (!videoUrl.trim()) return;

    createVideo.mutate({
      url: videoUrl,
      description,
    });
  };

  const getScore = (video: any) =>
    video.votes?.reduce((acc: number, v: any) => acc + v.value, 0) ?? 0;

  return (
    <>
      <Headbar />
      <main className="min-h-screen bg-gray-950 p-6 text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">🎥 Shared Videos</h1>

            <button
              onClick={() => setIsFormOpen((v) => !v)}
              className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
            >
              Share Video
            </button>
          </div>

          {/* Share Form */}
          {isFormOpen && (
            <div className="flex flex-col gap-2 rounded-xl bg-gray-800 p-4">
              <input
                type="text"
                placeholder="Paste YouTube link..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="rounded bg-gray-700 p-2 outline-none"
              />

              <textarea
                placeholder="Add description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded bg-gray-700 p-2 outline-none"
              />

              <button
                onClick={handleShare}
                disabled={!videoUrl.trim() || isSubmitting}
                className="rounded bg-green-500 px-4 py-2 hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? "Sharing..." : "Share Video"}
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoadingVideos && <p>Loading videos...</p>}

          {/* Empty */}
          {!isLoadingVideos && videos?.length === 0 && (
            <p className="text-gray-400">No videos shared yet.</p>
          )}

          {/* Video List */}
          <div className="flex flex-col gap-4">
            {videos?.map((video) => {
              const score = getScore(video);

              return (
                <div
                  key={video.id}
                  className="rounded-xl bg-gray-800 p-4 shadow"
                >
                  {/* Title */}
                  <p className="text-lg font-bold">{video.title}</p>

                  {/* Description */}
                  {video.description && (
                    <p className="mt-1 text-sm text-gray-300">
                      {video.description}
                    </p>
                  )}

                  {/* Meta */}
                  <p className="mt-1 text-sm text-gray-400">
                    Shared by {video.user.email}
                  </p>

                  {/* Video */}
                  <iframe
                    className="mt-3 w-full rounded"
                    height="300"
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    allowFullScreen
                  />

                  {/* Votes */}
                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-sm text-gray-300">Score: {score}</p>

                    <button
                      onClick={() => upvote.mutate({ videoId: video.id })}
                      className="rounded bg-green-600 px-3 py-1 hover:bg-green-700"
                    >
                      {/* 👍 {video._count?.upvotes ?? ""} */}
                    </button>

                    <button
                      onClick={() => downvote.mutate({ videoId: video.id })}
                      className="rounded bg-red-600 px-3 py-1 hover:bg-red-700"
                    >
                      {/* 👎 {video._count?.downvotes ?? ""} */}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
