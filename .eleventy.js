const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const CharacterSet = require("characterset");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "serverless",
    functionsDir: "./netlify/functions/",
  });

  eleventyConfig.addFilter("charCodeToString", code => String.fromCharCode(code));

  let commaChar = "x";
  let plusChar = "";
  function encodeRange(range = "") {
    return range.split("U+").join(plusChar).split(",").join(commaChar);
  }
  function decodeRange(str = "") {
    return str.split(commaChar).map(entry => `U+${entry}`).join(",");
  }
  function getCharsetFromRange(str) {
    return CharacterSet.parseUnicodeRange(decodeRange(str));
  }

  eleventyConfig.addFilter("charsetUrl", (code, previousCharacters) => {
    let charset = getCharsetFromRange(previousCharacters);
    let codeCharset = new CharacterSet(code);
    if(codeCharset.subset(charset)) {
      charset.remove(code); // toggle off
    } else {
      charset.add(code); // toggle on
    }
    return `/${encodeRange(charset.toHexRangeString())}/`;
  });

  eleventyConfig.addFilter("charctersToRange", (characters) => {
    let charset = getCharsetFromRange(characters);
    return charset.toHexRangeString();
  });

  eleventyConfig.addFilter("inCharacterSet", (code, characters) => {
    let charset = getCharsetFromRange(characters);
    let codeCharset = new CharacterSet(code);
    return codeCharset.subset(charset);
  });

  
};