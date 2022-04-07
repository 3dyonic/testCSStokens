const postcss = require("postcss");
const path = require("path");
const fs = require("fs");

describe("compare old css with new css", () => {
    it("warns for values that can be replaced with single CSS vars", async () => {
        const oldMap = parseCssFile(path.resolve(__dirname, "../dist/legacy/styles.css"), false);
        const newMap = parseCssFile(path.resolve(__dirname, "../dist/new/styles.css"), false);

        function getRealValue(map, value, key) {
            if (value && value.indexOf('var') > -1) { //var(--blue)
                const s = key.split(' ==>')[0]
                const selectorValue = `${s} ==> ${value.replace('var(', '').replace(")", "")}`;
                const {value : v, path} = getRealValue(map,map.get(selectorValue),key)
                return { value: v, path: selectorValue + ' ' + path}
            }
            return {value, path: key}
        }

        function assertMapInAnotherMap(map1, map2) {
            for (const [key, originalValue1] of map1) {
                const {value:value1, path:path1} = getRealValue(map1, originalValue1, key)

                const originalValue2 = map2.get(key);
                const {value :value2, path: path2} = getRealValue(map2, originalValue2, key)
                const compare = value1 === value2;
                if (!compare) {
                    throw Error(`for key ${key} , expect value
                     value1 ${value1} 
                     value2 ${value2}
                     result: ${originalValue1} !== ${originalValue2}
                     path1 ${path1}
                     path2 ${path2}
                    `);
                }
                // expect(`${key} ==> ${map2.get(key)}`).toEqual(`${key} ==> ${value}`);
                expect(compare).toBe(true);
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
            const {prop, value, parent, source} = decl;
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