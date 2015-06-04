## Diaspora  - CS 485, Summer 2015

#### Hypothesis:
The human diaspora out of Africa can be modeled with cellular automata.
=================================

### Running the simulation
The simulation runs as an HTML5 Canvas + JS application in your browser. This
was tested with Chrome on a Mac, so your mileage should hopefully not vary, but may.

To run the simulation, run
  `python -m SimpleHTTPServer`
from the root of this repo to start a webserver on port 8000

Then navigate to http://localhost:8000 to see it in action!

### Development
Run `npm install` to download the required dependencies for the simulation, then run
`npm start` to watch JS files for changes and recompile the `bundle.js` file accordingly.

### Generating graphs
Make sure to open the browser console once the web page has been loaded. Diagnostic
information will be printed to the console which can then be used to make charts using
R.

To do this, save the console log output to the file `data/diaspora.csv`, then run
  `Rscript make_plots.R`

Happy exploring!
