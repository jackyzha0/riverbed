import { ServiceBuilder, Ok, buildServiceDefs } from "@replit/river";
import { Type } from "@sinclair/typebox";
import { Observable } from "./observable";

export const SubscribableServiceConstructor = () =>
  ServiceBuilder.create("subscribable")
    .initialState({
      count: new Observable<number>(0),
    })
    .defineProcedure("add", {
      type: "rpc",
      input: Type.Object({ n: Type.Number() }),
      output: Type.Object({ result: Type.Number() }),
      errors: Type.Never(),
      async handler(ctx, { n }) {
        ctx.state.count.set((prev) => prev + n);
        return Ok({ result: ctx.state.count.get() });
      },
    })
    .defineProcedure("value", {
      type: "subscription",
      input: Type.Object({}),
      output: Type.Object({ result: Type.Number() }),
      errors: Type.Never(),
      async handler(ctx, _msg, returnStream) {
        ctx.state.count.observe((count) => {
          returnStream.push(Ok({ result: count }));
        });
      },
    })
    .finalize();

export const serviceDefs = buildServiceDefs([SubscribableServiceConstructor()]);
