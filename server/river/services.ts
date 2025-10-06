import { createServiceSchema, Procedure, Ok } from "@replit/river";
import { Type } from "@sinclair/typebox";
import { Observable } from "./observable";

const ServiceSchema = createServiceSchema();
export const SubscribableService = ServiceSchema.define(
  {
    initializeState: () => ({
      count: new Observable<number>(0),
    }),
  },
  {
    add: Procedure.rpc({
      requestInit: Type.Object({ n: Type.Number() }),
      responseData: Type.Object({ result: Type.Number() }),
      responseError: Type.Never(),
      async handler({ ctx, reqInit }) {
        const { n } = reqInit;
        ctx.state.count.set((prev) => prev + n);
        return Ok({ result: ctx.state.count.get() });
      },
    }),
    value: Procedure.subscription({
      requestInit: Type.Object({}),
      responseData: Type.Object({ result: Type.Number() }),
      responseError: Type.Never(),
      async handler({ ctx, resWritable }) {
        ctx.state.count.observe((count) => {
          resWritable.write(Ok({ result: count }));
        });
      },
    }),
  },
);

export const serviceDefs = {
  subscribable: SubscribableService,
};
