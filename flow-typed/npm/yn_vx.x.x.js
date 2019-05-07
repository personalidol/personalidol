// flow-typed signature: ad67f1ffad27fa7a4cec9906038ba907
// flow-typed version: <<STUB>>/yn_v^3.1.0/flow_v0.98.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'yn'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module "yn" {
  declare type Options = {|
    default?: boolean | null,
    lenient?: boolean
  |};

  declare function yn(1, ?Options): true;
  declare function yn(0, ?Options): false;

  declare function yn(true, ?Options): true;
  declare function yn(false, ?Options): false;

  declare function yn(
    string,
    {| default: boolean, lenient?: boolean |}
  ): boolean;
  declare function yn(string, ?Options): boolean | null;

  declare function yn(any, {| default: true, lenient?: boolean |}): true;
  declare function yn(any, {| default: false, lenient?: boolean |}): false;
  declare function yn(any, ?Options): null;

  declare module.exports: typeof yn;
}

// Filename aliases
declare module "yn/index" {
  declare module.exports: $Exports<"yn">;
}

declare module "yn/index.js" {
  declare module.exports: $Exports<"yn">;
}