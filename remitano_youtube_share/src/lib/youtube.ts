export const extractYoutubeId = (url: string) => {
  const regExp = /(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/;
  return url.match(regExp)?.[1];
};

export const getYoutubeTitle = async (videoId: string) => {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
  );

  if (!res.ok) {
    throw new Error("Invalid YouTube video");
  }

  const data = await res.json();
  return data.title;
};
