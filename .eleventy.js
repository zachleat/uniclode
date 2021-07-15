const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const CharacterSet = require("characterset");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "serverless",
    functionsDir: "./netlify/functions/",
  });

  let commaChar = "x";
  let plusChar = "";
  let isRangePrefix = "_";
  function encodeRange(range = "") {
    return isRangePrefix + range.split("U+").join(plusChar).split(",").join(commaChar);
  }
  function decodeRange(str = "") {
    return str.split(commaChar).map(entry => `U+${entry}`).join(",");
  }
  function getCharsetFromRange(str = "") {
    if(str.startsWith(isRangePrefix)) {
      return CharacterSet.parseUnicodeRange(decodeRange(str.substr(isRangePrefix.length)));
    }

    return new CharacterSet(str);
  }
  function isSubset(code, characters) {
    let charset = getCharsetFromRange(characters);
    let codeCharset = new CharacterSet(code);
    return codeCharset.subset(charset);
  }

  eleventyConfig.addFilter("charCodeToString", code => String.fromCharCode(code));

  eleventyConfig.addFilter("charsetUrl", (code, previousCharacters) => {
    let charset = getCharsetFromRange(previousCharacters);
    if(isSubset(code, previousCharacters)) {
      charset.remove(code); // toggle off
    } else {
      charset.add(code); // toggle on
    }

    let slug = encodeRange(charset.toHexRangeString());
    if(slug) {
      return `/${slug}/`;
    }
    return "/";
  });

  eleventyConfig.addFilter("charactersToRange", (characters) => {
    let charset = getCharsetFromRange(characters);
    return charset.toHexRangeString();
  });

  eleventyConfig.addFilter("inCharacterSet", (code, characters) => isSubset(code, characters));

  
};