import { ServiceSchema, Procedure, Ok } from "@replit/river";
import { Type } from "@sinclair/typebox";
import { Observable } from "./observable";

export const SubscribableService = ServiceSchema.define(
  {
    initializeState: () => ({
      count: new Observable<number>(0),
    }),
  },
  {
    add: Procedure.rpc({
      input: Type.Object({ n: Type.Number() }),
      output: Type.Object({ result: Type.Number() }),
      errors: Type.Never(),
      async handler(ctx, { n }) {
        ctx.state.count.set((prev) => prev + n);
        return Ok({ result: ctx.state.count.get() });
      },
    }),
    value: Procedure.subscription({
      input: Type.Object({}),
      output: Type.Object({ result: Type.Number() }),
      errors: Type.Never(),
      async handler(ctx, _msg, returnStream) {
        ctx.state.count.observe((count) => {
          returnStream.push(Ok({ result: count }));
        });
      },
    }),
  },
);

export const serviceDefs = {
  subscribable: SubscribableService,
};
