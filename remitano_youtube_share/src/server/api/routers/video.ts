import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { extractYoutubeId, getYoutubeTitle } from "~/lib/youtube";

export const videoRouter = createTRPCRouter({
  // Optional test route (like hello)
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  // 🎥 CREATE VIDEO (core feature)
  create: protectedProcedure
    .input(z.object({ url: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const videoId = extractYoutubeId(input.url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const title = await getYoutubeTitle(videoId);

      return ctx.db.video.create({
        data: {
          url: input.url,
          youtubeId: videoId,
          title,
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  // 📺 GET ALL VIDEOS (feed)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.video.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // 🔍 OPTIONAL: get latest by current user
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const video = await ctx.db.video.findFirst({
      orderBy: { createdAt: "desc" },
      where: { userId: ctx.session.user.id },
    });

    return video ?? null;
  }),
});
