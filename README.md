# Stablecoin Stress Map

Compare three synthetic stablecoin price paths: a fast wick, a slow bleed, and a double dip. Move the threshold to see which paths breach it, how long they stay below it, and when they recover.

## Run it

Node.js 24 or newer.

~~~sh
npm ci
npm run dev
~~~

Open the local URL printed by Vite. `npm test` checks the threshold calculations; `npm run build` builds the app.

## Read the chart

A breach starts below the selected threshold and ends on the first return to it. The model linearly interpolates threshold crossings between samples. A scenario that ends below the line is marked as not recovered; its time below the threshold is counted through the end of the window. The maximum drop is measured against $1, independent of the threshold.

The scenarios are illustrative, not historical observations or a prediction of future stablecoin behavior.
