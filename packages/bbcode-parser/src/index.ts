import type { Plugin } from 'unified';
import { fromBBCode, type ParseOptions } from "@onachi/bbast-util-from-bbcode";

const bbcodeParser: Plugin<[ParseOptions?]> = function (options) {
  this.parser = (bbcode: string) => {
    // Use the fromBBCode function to parse BBCode into BBast
    return fromBBCode(bbcode, options);
  }
}

export default bbcodeParser;