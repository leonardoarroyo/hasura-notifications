import "ramda"

declare module "ramda" {
  export function pipeWith(composer: (a: any, b: any) => any): <V0, T>(fns: PipeWithFns<V0, T>) => (x0: V0) => T;
}
