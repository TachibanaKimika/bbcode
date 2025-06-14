import type { Plugin } from 'unified';
import { toHast, ToHastOptions } from "@onachi/bbast-util-to-hast";
import { Root } from '@onachi/bbast';

const bbcodeRehype: Plugin<[ToHastOptions?], Root> = function (opt) {
  return (bbast: Root) => {
    return toHast(bbast, opt);
  }
} as Plugin<[ToHastOptions?], Root>;

export default bbcodeRehype;