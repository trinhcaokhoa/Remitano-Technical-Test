import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { extractYoutubeId, getYoutubeTitle } from "~/lib/youtube";
import { notificationQueue } from "~/server/queue";

export const videoRouter = createTRPCRouter({
  // TESTING PURPOSE ONLY
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // CREATE VIDEO
  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const videoId = extractYoutubeId(input.url);
      if (!videoId) throw new Error("Invalid URL");

      const title = await getYoutubeTitle(videoId);

      const video = await ctx.db.video.create({
        data: {
          url: input.url,
          youtubeId: videoId,
          title,
          description: input.description ?? "",
          userId: ctx.session.user.id,
        },
      });

      await notificationQueue.add("new-video", {
        title,
        user: ctx.session.user,
      });

      return video;
    }),

  // GET ALL VIDEOS
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.video.findMany({
      include: {
        user: true,
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  //   get latest by current user
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const video = await ctx.db.video.findFirst({
      orderBy: { createdAt: "desc" },
      where: { userId: ctx.session.user.id },
    });

    return video ?? null;
  }),
});
