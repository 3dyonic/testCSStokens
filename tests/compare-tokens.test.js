const postcss = require("postcss");
const path = require("path");
const fs = require("fs");

describe("compare old css with new css", () => {
    it("warns for values that can be replaced with single CSS vars", async () => {
        const oldMap = parseCssFile(path.resolve(__dirname, "../dist/legacy/styles.css"), false);
        const newMap = parseCssFile(path.resolve(__dirname, "../dist/new/styles.css"), false);

        function assertMapInAnotherMap(map1, map2) {
            for (const [key, value] of map1) {
                expect(`${key} ==> ${map2.get(key)}`).toEqual(`${key} ==> ${value}`);
            }
        }
        assertMapInAnotherMap(oldMap, newMap);
        assertMapInAnotherMap(newMap, oldMap);
    });

    function parseCssFile(pathToFile, throwOnDuplication) {
        const css = fs.readFileSync(pathToFile);
        const ast = postcss.parse(css);
        const map = new Map();

        ast.walkDecls(/^--/, (decl) => {
            const { prop, value, parent, source } = decl;
            const propKey = `${parent.selector} ==> ${prop}`;
            if (throwOnDuplication && map.get(propKey)) {
                throw new Error(
                    `Prop ${propKey} already has definition for ${map.get(
                        propKey
                    )} (was about to set a new definition for ${value} on line ${source.start.line})`
                );
            }
            map.set(propKey, value);
        });

        return map;
    }
});