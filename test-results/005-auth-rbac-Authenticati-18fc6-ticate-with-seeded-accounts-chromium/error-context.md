# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Build Error" [level=1] [ref=e7]
        - paragraph [ref=e8]: Failed to compile
        - generic [ref=e9]:
          - text: Next.js (14.2.13) is outdated
          - link "(learn more)" [ref=e11] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
      - generic [ref=e12]:
        - generic [ref=e13]:
          - link "./app/globals.css.webpack[javascript/auto]!=!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./app/globals.css" [ref=e14] [cursor=pointer]:
            - text: ./app/globals.css.webpack[javascript/auto]!=!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./app/globals.css
            - img
          - generic [ref=e18]:
            - generic [ref=e19]: "Error: Cannot find module '@tailwindcss/typography' Require stack: - /Users/henry/Github/Github_desktop/cortex-dc-web/apps/web/tailwind.config.js Import trace for requested module:"
            - link "./app/globals.css.webpack[javascript/auto]!=!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./app/globals.css" [ref=e20] [cursor=pointer]:
              - text: ./app/globals.css.webpack[javascript/auto]!=!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!../../node_modules/.pnpm/next@14.2.13_@playwright+test@1.56.0_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./app/globals.css
              - img [ref=e21]
            - link "./app/globals.css" [ref=e25] [cursor=pointer]:
              - text: ./app/globals.css
              - img [ref=e26]
        - contentinfo [ref=e30]:
          - paragraph [ref=e31]: This error occurred during the build process and can only be dismissed by fixing the error.
```