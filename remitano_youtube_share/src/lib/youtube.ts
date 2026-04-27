export const extractYoutubeId = (url: string): string | undefined => {
  const regExp = /(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/;
  const match = regExp.exec(url);
  return match?.[1];
};

export const getYoutubeTitle = async (videoId: string): Promise<string> => {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );

  if (!res.ok) {
    throw new Error("Invalid YouTube video");
  }

  const data = (await res.json()) as { title: string };
  return data.title;
};
