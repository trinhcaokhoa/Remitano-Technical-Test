import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const voteRouter = createTRPCRouter({
  upvote: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.vote.upsert({
        where: {
          userId_videoId: {
            userId: ctx.session.user.id,
            videoId: input.videoId,
          },
        },
        update: {
          value: 1,
        },
        create: {
          value: 1,
          userId: ctx.session.user.id,
          videoId: input.videoId,
        },
      });
    }),

  downvote: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.vote.upsert({
        where: {
          userId_videoId: {
            userId: ctx.session.user.id,
            videoId: input.videoId,
          },
        },
        update: {
          value: -1,
        },
        create: {
          value: -1,
          userId: ctx.session.user.id,
          videoId: input.videoId,
        },
      });
    }),
});
