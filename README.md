# Compare CSS tokens test

Install dependencies

````
npm i
````

Compile css from legacy and new

````
npm run styles
````

Run Test file from "tests/compare-tokens.test.js"

### Desired result: 
for: 
````css
:root {
  --red: red;
  --primary: var(--red); }
````
 should be equal to:
 ````css
:root {
  --red: red;
  --primary: red; }
````
Test should be able to figure out that
````css
--primary: var(--red)
````
Is the same as
````css
--primary: red;
````
since ``var(--red)`` is ``--red: red``
