import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  getTodo: publicProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ input, ctx }) => {
      const date = new Date(input.date);
      return await ctx.prisma.todo.findUnique({
        where: { date },
        select: { date: true, now: true, next: true, notYet: true, mood: true },
      });
    }),
  upsertMood: publicProcedure
    .input(
      z.object({
        date: z.string().or(z.date()),
        mood: z.number().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const date = new Date(input.date);
      const mood = input.mood || undefined;
      return await ctx.prisma.todo.upsert({
        where: { date },
        create: { date, mood },
        update: { date, mood },
      });
    }),
  upsertTodo: publicProcedure
    .input(
      z.object({
        date: z.string().or(z.date()),
        now: z
          .array(
            z.object({
              priority: z.boolean(),
              completed: z.boolean(),
              task: z.string(),
            })
          )
          .nullable(),
        next: z
          .array(
            z.object({
              priority: z.boolean(),
              completed: z.boolean(),
              task: z.string(),
            })
          )
          .nullable(),
        notYet: z
          .array(
            z.object({
              priority: z.boolean(),
              completed: z.boolean(),
              task: z.string(),
            })
          )
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date);
      const data = {
        date,
        now:
          input.now !== null
            ? input.now
            : [
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
              ],
        next:
          input.next !== null
            ? input.next
            : [
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
              ],
        notYet:
          input.notYet !== null
            ? input.notYet
            : [
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
                {
                  priority: false,
                  completed: false,
                  task: "",
                },
              ],
      };
      return await ctx.prisma.todo.upsert({
        where: { date },
        create: data,
        update: data,
      });
    }),
});
